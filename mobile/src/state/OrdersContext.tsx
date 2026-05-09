import NetInfo from '@react-native-community/netinfo';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ActionSubmitResult, DeliveryOrder, FailPayload, DeliverPayload } from '../types';
import { fetchOrders, getCodSummary, markDelivered, markFailed } from '../services/api';
import { loadOrders, loadQueue, saveOrders } from '../services/storage';
import { enqueueAction, syncQueue } from '../services/offlineQueue';
import { useAuth } from './AuthContext';

type OrdersState = {
  orders: DeliveryOrder[];
  loading: boolean;
  pendingSync: number;
  refresh: () => Promise<void>;
  deliverOrder: (orderId: string, payload: DeliverPayload) => Promise<ActionSubmitResult>;
  failOrder: (orderId: string, payload: FailPayload) => Promise<ActionSubmitResult>;
  syncOfflineQueue: () => Promise<void>;
  codSummary: ReturnType<typeof getCodSummary>;
};

const OrdersContext = createContext<OrdersState | null>(null);

export function OrdersProvider({ children, district }: PropsWithChildren<{ district: string }>) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);

  const refresh = useCallback(async () => {
    setLoading(true);
    const cached = await loadOrders();
    if (cached.length) setOrders(cached);
    try {
      const fresh = await fetchOrders(district, user?.token, user?.name);
      setOrders(fresh);
      await saveOrders(fresh);
    } finally {
      setLoading(false);
    }
  }, [district, user?.name, user?.token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    loadQueue().then((queue) => setPendingSync(queue.length));
  }, []);

  const syncOfflineQueue = useCallback(async () => {
    const result = await syncQueue(user?.token);
    setPendingSync(result.remaining);
    if (result.synced > 0) await refresh();
  }, [refresh, user?.token]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) void syncOfflineQueue();
    });
    return unsubscribe;
  }, [syncOfflineQueue]);

  async function deliverOrder(orderId: string, payload: DeliverPayload): Promise<ActionSubmitResult> {
    const state = await NetInfo.fetch();
    const updatedOrders = orders.map((order) => order.id === orderId ? { ...order, status: 'delivered' as const, photoUrl: payload.photoUri, updatedAt: new Date().toISOString() } : order);
    setOrders(updatedOrders);
    await saveOrders(updatedOrders);
    if (state.isConnected) {
      try {
        await markDelivered(orderId, payload, user?.token);
        return { status: 'synced', message: 'Delivery updated in Google Sheet.' };
      } catch {
        await enqueueAction({ id: `deliver-${Date.now()}`, type: 'deliver', orderId, payload, createdAt: new Date().toISOString() });
        setPendingSync((count) => count + 1);
        return { status: 'queued', message: 'Delivery saved locally. It will sync when GAS is reachable.' };
      }
    }

    await enqueueAction({ id: `deliver-${Date.now()}`, type: 'deliver', orderId, payload, createdAt: new Date().toISOString() });
    setPendingSync((count) => count + 1);
    return { status: 'queued', message: 'Delivery saved offline. It will sync when network returns.' };
  }

  async function failOrder(orderId: string, payload: FailPayload): Promise<ActionSubmitResult> {
    const state = await NetInfo.fetch();
    const updatedOrders = orders.map((order) => order.id === orderId ? { ...order, status: 'failed' as const, remarks: `FAILED: ${payload.reason}`, attempts: order.attempts + 1, updatedAt: new Date().toISOString() } : order);
    setOrders(updatedOrders);
    await saveOrders(updatedOrders);
    if (state.isConnected) {
      try {
        await markFailed(orderId, payload, user?.token);
        return { status: 'synced', message: 'Failed delivery updated in Google Sheet.' };
      } catch {
        await enqueueAction({ id: `fail-${Date.now()}`, type: 'fail', orderId, payload, createdAt: new Date().toISOString() });
        setPendingSync((count) => count + 1);
        return { status: 'queued', message: 'Failed delivery saved locally. It will sync when GAS is reachable.' };
      }
    }

    await enqueueAction({ id: `fail-${Date.now()}`, type: 'fail', orderId, payload, createdAt: new Date().toISOString() });
    setPendingSync((count) => count + 1);
    return { status: 'queued', message: 'Failed delivery saved offline. It will sync when network returns.' };
  }

  const value = useMemo<OrdersState>(() => ({
    orders,
    loading,
    pendingSync,
    refresh,
    deliverOrder,
    failOrder,
    syncOfflineQueue,
    codSummary: getCodSummary(orders),
  }), [orders, loading, pendingSync, refresh, syncOfflineQueue]);

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const value = useContext(OrdersContext);
  if (!value) throw new Error('useOrders must be used inside OrdersProvider');
  return value;
}
