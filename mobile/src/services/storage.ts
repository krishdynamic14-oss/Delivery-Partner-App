import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { DeliveryOrder, Partner, QueueAction, SyncMeta } from '../types';

const USER_KEY = 'db.partner';
const ORDERS_KEY = 'db.orders';
const QUEUE_KEY = 'db.offlineQueue';
const SYNC_META_KEY = 'db.syncMeta';

export const DEFAULT_SYNC_META: SyncMeta = {
  status: 'idle',
  message: 'No sync activity yet.',
};

export async function savePartner(partner: Partner) {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(partner));
}

export async function loadPartner(): Promise<Partner | null> {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearPartner() {
  await SecureStore.deleteItemAsync(USER_KEY);
}

export async function saveOrders(orders: DeliveryOrder[]) {
  await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export async function loadOrders(): Promise<DeliveryOrder[]> {
  const raw = await AsyncStorage.getItem(ORDERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveQueue(queue: QueueAction[]) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function loadQueue(): Promise<QueueAction[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    await AsyncStorage.removeItem(QUEUE_KEY);
    return [];
  }
}

export async function clearQueue() {
  await AsyncStorage.removeItem(QUEUE_KEY);
}

export async function saveSyncMeta(meta: SyncMeta) {
  await AsyncStorage.setItem(SYNC_META_KEY, JSON.stringify(meta));
}

export async function loadSyncMeta(): Promise<SyncMeta> {
  const raw = await AsyncStorage.getItem(SYNC_META_KEY);
  return raw ? JSON.parse(raw) : DEFAULT_SYNC_META;
}
