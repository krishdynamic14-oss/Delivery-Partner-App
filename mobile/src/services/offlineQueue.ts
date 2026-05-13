import NetInfo from '@react-native-community/netinfo';
import { loadQueue, saveQueue } from './storage';
import { markDelivered, markFailed, submitSettlement } from './api';
import type { Partner, QueueAction, SyncQueueResult } from '../types';

export async function enqueueAction(action: QueueAction, owner?: Partner | null) {
  const queue = await loadQueue();
  await saveQueue([...queue, sanitizeQueueAction(withQueueOwner(action, owner))]);
}

export async function loadQueueForUser(user?: Partner | null): Promise<QueueAction[]> {
  const queue = await loadQueue();
  return queue.filter((action) => queueBelongsToUser(action, user));
}

export function queueBelongsToUser(action: QueueAction, user?: Partner | null) {
  if (!user) return false;
  if (action.ownerId) return action.ownerId === user.id;
  return user.role !== 'admin';
}

export async function syncQueue(token?: string, user?: Partner | null): Promise<SyncQueueResult> {
  const state = await NetInfo.fetch();
  if (!state.isConnected) {
    const remaining = (await loadQueueForUser(user)).length;
    return {
      synced: 0,
      remaining,
      failed: 0,
      status: 'offline',
      message: remaining ? `${remaining} action(s) waiting for network.` : 'Offline. Nothing pending.',
    };
  }

  const allQueue = await loadQueue();
  const queue = allQueue.filter((action) => queueBelongsToUser(action, user));
  if (!queue.length) {
    return {
      synced: 0,
      remaining: 0,
      failed: 0,
      status: 'success',
      message: 'All actions are already synced.',
    };
  }

  const remaining: QueueAction[] = [];
  let synced = 0;

  for (const action of queue) {
    try {
      if (action.type === 'deliver') await markDelivered(action.orderId, action.payload, token);
      if (action.type === 'fail') await markFailed(action.orderId, action.payload, token);
      if (action.type === 'settle') await submitSettlement(action.payload, token);
      synced += 1;
    } catch {
      remaining.push(action);
    }
  }

  await saveQueue([
    ...allQueue.filter((action) => !queueBelongsToUser(action, user)),
    ...remaining,
  ]);
  const failed = remaining.length;
  return {
    synced,
    remaining: failed,
    failed,
    status: failed ? 'warning' : 'success',
    message: failed
      ? `${synced} synced. ${failed} action(s) still need retry.`
      : `${synced} queued action(s) synced successfully.`,
  };
}

function withQueueOwner(action: QueueAction, owner?: Partner | null): QueueAction {
  if (!owner) return action;
  return {
    ...action,
    ownerId: owner.id,
    ownerRole: owner.role,
  };
}

function sanitizeQueueAction(action: QueueAction): QueueAction {
  if (action.type === 'deliver') {
    const { photoBase64, ...payload } = action.payload;
    return { ...action, payload };
  }
  if (action.type === 'fail') {
    const { photoBase64, ...payload } = action.payload;
    return { ...action, payload };
  }
  return action;
}
