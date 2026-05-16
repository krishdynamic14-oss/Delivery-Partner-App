import * as FileSystem from 'expo-file-system/legacy';
import NetInfo from '@react-native-community/netinfo';
import { loadQueue, saveQueue } from './storage';
import { markDelivered, markFailed, submitSettlement } from './api';
import { prepareProofImageFromUri } from './proofImages';
import type { DeliverPayload, FailPayload, Partner, QueueAction, SettlementPayload, SyncQueueResult } from '../types';

const MAX_CALL_RECORDING_BYTES = 12 * 1024 * 1024;

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
      if (action.type === 'deliver') await markDelivered(action.orderId, await hydrateDeliverPayload(action.payload), token);
      if (action.type === 'fail') await markFailed(action.orderId, await hydrateFailPayload(action.payload), token);
      if (action.type === 'settle') await submitSettlement(await hydrateSettlementPayload(action.payload), token);
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
    const { photoBase64, callRecordingBase64, ...payload } = action.payload;
    return { ...action, payload };
  }
  return action;
}

async function hydrateDeliverPayload(payload: DeliverPayload): Promise<DeliverPayload> {
  if (!payload.photoBase64 && payload.photoUri) {
    const proof = await prepareProofImageFromUri(payload.photoUri, payload.photoFileName || `delivery-proof-${Date.now()}.jpg`);
    return {
      ...payload,
      photoUri: proof.uri,
      photoBase64: proof.base64,
      photoMimeType: proof.mimeType,
      photoFileName: proof.fileName,
      uploadProof: true,
    };
  }
  return payload;
}

async function hydrateFailPayload(payload: FailPayload): Promise<FailPayload> {
  let nextPayload = payload;
  if (!nextPayload.photoBase64 && nextPayload.photoUri) {
    const proof = await prepareProofImageFromUri(nextPayload.photoUri, nextPayload.photoFileName || `failed-proof-${Date.now()}.jpg`);
    nextPayload = {
      ...nextPayload,
      photoUri: proof.uri,
      photoBase64: proof.base64,
      photoMimeType: proof.mimeType,
      photoFileName: proof.fileName,
      uploadProof: true,
    };
  }
  if (!nextPayload.callRecordingBase64 && nextPayload.callRecordingUri) {
    const recordingBase64 = await FileSystem.readAsStringAsync(nextPayload.callRecordingUri, { encoding: FileSystem.EncodingType.Base64 });
    if (estimateBase64Bytes(recordingBase64) > MAX_CALL_RECORDING_BYTES) {
      throw new Error('Call recording is too large. Attach a recording smaller than 12 MB before syncing.');
    }
    nextPayload = {
      ...nextPayload,
      callRecordingBase64: recordingBase64,
      callRecordingMimeType: nextPayload.callRecordingMimeType || 'audio/mpeg',
      callRecordingFileName: nextPayload.callRecordingFileName || `call-recording-${Date.now()}.mp3`,
      uploadCallRecording: true,
    };
  }
  return nextPayload;
}

async function hydrateSettlementPayload(payload: SettlementPayload): Promise<SettlementPayload> {
  if (!payload.photoBase64 && payload.photoUri) {
    const proof = await prepareProofImageFromUri(payload.photoUri, payload.photoFileName || `payment-proof-${Date.now()}.jpg`);
    return {
      ...payload,
      photoUri: proof.uri,
      photoBase64: proof.base64,
      photoMimeType: proof.mimeType,
      photoFileName: proof.fileName,
    };
  }
  return payload;
}

function estimateBase64Bytes(value: string) {
  const padding = value.endsWith('==') ? 2 : value.endsWith('=') ? 1 : 0;
  return Math.ceil((value.length * 3) / 4) - padding;
}
