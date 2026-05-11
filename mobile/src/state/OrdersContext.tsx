import NetInfo from '@react-native-community/netinfo';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ActionSubmitResult, DeliveryOrder, FailPayload, DeliverPayload, SyncMeta, SyncQueueResult } from '../types';
import { fetchOrders, getCodSummary, markDelivered, markFailed } from '../services/api';
import { DEFAULT_SYNC_META, loadOrders, loadQueue, loadSyncMeta, saveOrders, saveSyncMeta } from '../services/storage';
import { enqueueAction, syncQueue } from '../services/offlineQueue';
import { useAuth } from './AuthContext';

type OrdersState = {
  orders: DeliveryOrder[];
  loading: boolean;
  syncing: boolean;
  isOnline: boolean | null;
  pendingSync: number;
  syncMeta: SyncMeta;
  refresh: () => Promise<void>;
  deliverOrder: (orderId: string, payload: DeliverPayload) => Promise<ActionSubmitResult>;
  failOrder: (orderId: string, payload: FailPayload) => Promise<ActionSubmitResult>;
  syncOfflineQueue: () => Promise<SyncQueueResult>;
  codSummary: ReturnType<typeof getCodSummary>;
};

const OrdersContext = createContext<OrdersState | null>(null);

export function OrdersProvider({ children, district }: PropsWithChildren<{ district: string }>) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [pendingSync, setPendingSync] = useState(0);
  const [syncMeta, setSyncMeta] = useState<SyncMeta>(DEFAULT_SYNC_META);

  const persistSyncMeta = useCallback(async (meta: SyncMeta) => {
    setSyncMeta(meta);
    await saveSyncMeta(meta);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    const cached = await loadOrders();
    if (cached.length) setOrders(cached);
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const fresh = await fetchOrders(district, user?.token, user?.name);
      setOrders(fresh);
      await saveOrders(fresh);
      await persistSyncMeta({
        status: 'success',
        message: 'Orders refreshed from Google Sheets.',
        lastSyncAt: new Date().toISOString(),
      });
    } catch (err) {
      await persistSyncMeta({
        status: cached.length ? 'warning' : 'error',
        message: cached.length ? 'Showing cached orders. Refresh failed.' : 'Could not refresh orders.',
        lastError: getErrorMessage(err),
      });
    } finally {
      setLoading(false);
    }
  }, [district, persistSyncMeta, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    Promise.all([loadQueue(), loadSyncMeta(), NetInfo.fetch()]).then(([queue, meta, state]) => {
      setPendingSync(queue.length);
      setSyncMeta(meta);
      setIsOnline(state.isConnected ?? null);
    });
  }, []);

  const syncOfflineQueue = useCallback(async (): Promise<SyncQueueResult> => {
    if (!user?.token) {
      const queue = await loadQueue();
      const result: SyncQueueResult = {
        synced: 0,
        remaining: queue.length,
        failed: 0,
        status: 'warning',
        message: 'Sign in as a delivery partner to sync queued actions.',
      };
      setPendingSync(queue.length);
      await persistSyncMeta({ status: result.status, message: result.message });
      return result;
    }

    setSyncing(true);
    setSyncMeta((current) => ({ ...current, status: 'syncing', message: 'Syncing queued actions...' }));
    try {
      const result = await syncQueue(user?.token);
      setPendingSync(result.remaining);
      await persistSyncMeta({
        status: result.status,
        message: result.message,
        lastSyncAt: new Date().toISOString(),
        lastError: result.status === 'warning' || result.status === 'error' ? result.message : undefined,
      });
      if (result.synced > 0) await refresh();
      return result;
    } catch (err) {
      const message = getErrorMessage(err);
      await persistSyncMeta({
        status: 'error',
        message: 'Sync failed. Please retry.',
        lastSyncAt: new Date().toISOString(),
        lastError: message,
      });
      const result: SyncQueueResult = { synced: 0, remaining: pendingSync, failed: pendingSync, status: 'error', message };
      return result;
    } finally {
      setSyncing(false);
    }
  }, [pendingSync, persistSyncMeta, refresh, user?.token]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? null);
      if (state.isConnected) void syncOfflineQueue();
    });
    return unsubscribe;
  }, [syncOfflineQueue]);

  async function deliverOrder(orderId: string, payload: DeliverPayload): Promise<ActionSubmitResult> {
    const state = await NetInfo.fetch();
    const updatedOrders = orders.map((order) => order.id === orderId ? { ...order, status: 'delivered' as const, photoUrl: payload.photoUri, updatedAt: new Date().toISOString() } : order);
    if (state.isConnected) {
      try {
        const result = await markDelivered(orderId, payload, user?.token);
        const photoUrl = result.photoUrl || payload.photoUri;
        const syncedOrders = updatedOrders.map((order) => order.id === orderId ? { ...order, photoUrl } : order);
        setOrders(syncedOrders);
        await saveOrders(syncedOrders);
        return {
          status: 'synced',
          message: result.photoUrl ? 'Delivery and proof photo synced to Google Sheets.' : 'Delivery updated in Google Sheet. Proof photo stays on this device for now.',
          photoUrl: result.photoUrl,
        };
      } catch (err) {
        const message = getErrorMessage(err);
        await persistSyncMeta({ status: 'error', message: 'Delivery sync failed. Please retry online.', lastError: message });
        throw new Error(message);
      }
    }

    await persistSyncMeta({ status: 'offline', message: 'Delivery submit needs network. Reconnect and try again.' });
    throw new Error('Delivery submit needs network. Reconnect and try again.');
  }

  async function failOrder(orderId: string, payload: FailPayload): Promise<ActionSubmitResult> {
    const state = await NetInfo.fetch();
    const proofDetail = payload.photoUri ? 'House proof captured locally' : '';
    const failureDetail = [payload.notes, payload.nextAttemptDate ? `Next attempt: ${payload.nextAttemptDate}` : '', proofDetail].filter(Boolean).join(' | ');
    const remarks = `FAILED: ${payload.reason}${failureDetail ? ` | ${failureDetail}` : ''}`;
    const updatedOrders = orders.map((order) => order.id === orderId ? { ...order, status: 'failed' as const, remarks, photoUrl: payload.photoUri || order.photoUrl, attempts: order.attempts + 1, updatedAt: new Date().toISOString() } : order);
    setOrders(updatedOrders);
    await saveOrders(updatedOrders);
    if (state.isConnected) {
      try {
        await markFailed(orderId, payload, user?.token);
        return { status: 'synced', message: 'Failed delivery updated in Google Sheet.' };
      } catch (err) {
        const message = getErrorMessage(err);
        await enqueueAction({ id: `fail-${Date.now()}`, type: 'fail', orderId, payload, createdAt: new Date().toISOString() });
        setPendingSync((count) => count + 1);
        await persistSyncMeta({ status: 'warning', message: 'Failed delivery queued because GAS sync failed.', lastError: message });
        return { status: 'queued', message: `Failed delivery saved locally. GAS error: ${message}` };
      }
    }

    await enqueueAction({ id: `fail-${Date.now()}`, type: 'fail', orderId, payload, createdAt: new Date().toISOString() });
    setPendingSync((count) => count + 1);
    await persistSyncMeta({ status: 'offline', message: 'Failed delivery queued offline.' });
    return { status: 'queued', message: 'Failed delivery saved offline. It will sync when network returns.' };
  }

  const value = useMemo<OrdersState>(() => ({
    orders,
    loading,
    syncing,
    isOnline,
    pendingSync,
    syncMeta,
    refresh,
    deliverOrder,
    failOrder,
    syncOfflineQueue,
    codSummary: getCodSummary(orders),
  }), [orders, loading, syncing, isOnline, pendingSync, syncMeta, refresh, syncOfflineQueue]);

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const value = useContext(OrdersContext);
  if (!value) throw new Error('useOrders must be used inside OrdersProvider');
  return value;
}

function getErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : 'Unknown sync error.';
}
