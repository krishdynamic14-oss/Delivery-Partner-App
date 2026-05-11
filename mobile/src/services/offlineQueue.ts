import NetInfo from '@react-native-community/netinfo';
import { loadQueue, saveQueue } from './storage';
import { markDelivered, markFailed, submitSettlement } from './api';
import type { QueueAction, SyncQueueResult } from '../types';

export async function enqueueAction(action: QueueAction) {
  const queue = await loadQueue();
  await saveQueue([...queue, sanitizeQueueAction(action)]);
}

export async function syncQueue(token?: string): Promise<SyncQueueResult> {
  const state = await NetInfo.fetch();
  if (!state.isConnected) {
    const remaining = (await loadQueue()).length;
    return {
      synced: 0,
      remaining,
      failed: 0,
      status: 'offline',
      message: remaining ? `${remaining} action(s) waiting for network.` : 'Offline. Nothing pending.',
    };
  }

  const queue = await loadQueue();
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

  await saveQueue(remaining);
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

function sanitizeQueueAction(action: QueueAction): QueueAction {
  if (action.type !== 'deliver') return action;
  const { photoBase64, ...payload } = action.payload;
  return { ...action, payload };
}
