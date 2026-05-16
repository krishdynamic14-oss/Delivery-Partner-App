import * as FileSystem from 'expo-file-system/legacy';
import type { DeliverPayload, FailPayload, QueueAction, SettlementPayload } from '../types';

const PROOF_DIR_NAME = 'dynamic-bazar-proofs';

export async function persistProofFile(sourceUri: string, fileName: string): Promise<string> {
  const proofDir = await ensureProofDir();
  const targetUri = proofDir + sanitizeFileName(fileName);
  if (sourceUri === targetUri || sourceUri.startsWith(proofDir)) return sourceUri;
  await FileSystem.copyAsync({ from: sourceUri, to: targetUri });
  return targetUri;
}

export async function deleteActionProofFiles(action: QueueAction) {
  if (action.type === 'deliver') {
    await deletePayloadProofFiles(action.payload);
  } else if (action.type === 'fail') {
    await deletePayloadProofFiles(action.payload);
  } else if (action.type === 'settle') {
    await deletePayloadProofFiles(action.payload);
  }
}

export async function deletePayloadProofFiles(payload: DeliverPayload | FailPayload | SettlementPayload) {
  const uris = [
    payload.photoUri,
    'callRecordingUri' in payload ? payload.callRecordingUri : undefined,
  ].filter(Boolean) as string[];
  await Promise.all(uris.map((uri) => deletePersistedProofFile(uri)));
}

async function deletePersistedProofFile(uri: string) {
  const proofDir = getProofDir();
  if (!proofDir || !uri.startsWith(proofDir)) return;
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // Best-effort cleanup; failed deletion should never block sync or navigation.
  }
}

async function ensureProofDir() {
  const proofDir = getProofDir();
  if (!proofDir) throw new Error('Local proof storage is not available on this device.');
  const info = await FileSystem.getInfoAsync(proofDir);
  if (!info.exists) await FileSystem.makeDirectoryAsync(proofDir, { intermediates: true });
  return proofDir;
}

function getProofDir() {
  return FileSystem.documentDirectory ? `${FileSystem.documentDirectory}${PROOF_DIR_NAME}/` : '';
}

function sanitizeFileName(fileName: string) {
  const safe = String(fileName || `proof-${Date.now()}.bin`).replace(/[^A-Za-z0-9._-]/g, '_');
  return safe || `proof-${Date.now()}.bin`;
}
