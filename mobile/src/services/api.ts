import type { CodSummary, DeliverPayload, DeliveryOrder, FailPayload, Partner, SettlementPayload } from '../types';
import { mockOrders } from '../data/mockOrders';

const GAS_URL = process.env.EXPO_PUBLIC_GAS_API_URL;

type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };

async function request<T>(action: string, body?: unknown, token?: string): Promise<T> {
  if (!GAS_URL) throw new Error('GAS URL is not configured');
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ action, body, ...(token ? { __token: token } : {}) }),
  });
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.ok) throw new Error(json.error);
  return json.data;
}

export async function loginWithPhone(phone: string): Promise<Partner> {
  if (GAS_URL) return request<Partner>('auth.demoLogin', { phone });
  return {
    id: 'partner_ahmedabad',
    name: 'SURESHBHAI',
    phone,
    district: 'AHMEDABAD',
    role: 'partner',
    token: 'demo-token',
  };
}

export async function fetchOrders(district: string, token?: string, partnerName?: string): Promise<DeliveryOrder[]> {
  if (GAS_URL && district === 'ALL') return request<DeliveryOrder[]>('orders.all', {}, token);
  if (GAS_URL) return request<DeliveryOrder[]>('orders.byDistrictAndPartner', { district, partnerName }, token);
  return mockOrders.filter((order) => order.district === district || order.assignedTo === 'SURESHBHAI');
}

export async function markDelivered(orderId: string, payload: DeliverPayload, token?: string) {
  if (GAS_URL) return request<{ updated: true; photoUrl?: string }>('orders.deliver', { orderId, ...payload }, token);
  return { updated: true, photoUrl: payload.photoUri };
}

export async function markFailed(orderId: string, payload: FailPayload, token?: string) {
  if (GAS_URL) return request<{ updated: true; photoUrl?: string }>('orders.fail', { orderId, ...payload }, token);
  return { updated: true, photoUrl: payload.photoUri };
}

export async function submitSettlement(payload: SettlementPayload, token?: string) {
  if (GAS_URL) return request<{ settlementId: string }>('cod.settle', payload, token);
  return { settlementId: `SET-${Date.now()}` };
}

export function getCodSummary(orders: DeliveryOrder[]): CodSummary {
  const codOrders = orders.filter((order) => order.paymentType === 'COD');
  const assigned = codOrders.reduce((sum, order) => sum + order.amount, 0);
  const collected = codOrders.filter((order) => order.status === 'delivered').reduce((sum, order) => sum + order.amount, 0);
  return {
    assigned,
    collected,
    remaining: assigned - collected,
    prepaidCount: orders.filter((order) => order.paymentType === 'Prepaid').length,
  };
}
