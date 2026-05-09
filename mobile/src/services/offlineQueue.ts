import NetInfo from '@react-native-community/netinfo';
import { loadQueue, saveQueue } from './storage';
import { markDelivered, markFailed, submitSettlement } from './api';
import type { QueueAction } from '../types';

export async function enqueueAction(action: QueueAction) {
  const queue = await loadQueue();
  await saveQueue([...queue, action]);
}

export async function syncQueue(token?: string) {
  const state = await NetInfo.fetch();
  if (!state.isConnected) return { synced: 0, remaining: (await loadQueue()).length };

  const queue = await loadQueue();
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
  return { synced, remaining: remaining.length };
}
