import type {
  CodSettlement,
  CodSettlementSummary,
  CodSummary,
  DeliverPayload,
  DeliveryOrder,
  DeliveryPartnerSummary,
  FailPayload,
  LoginPayload,
  MaskedCallResult,
  Partner,
  PartnerLiveLocation,
  PartnerLocationUpdate,
  PushTokenRegistration,
  SendDeliveryOtpResult,
  SettlementPayload,
  StockDispatchPayload,
  StockItem,
} from '../types';
import { mockOrders } from '../data/mockOrders';
import { getUserSafeMessageFromText } from './errors';

const GAS_URL = process.env.EXPO_PUBLIC_GAS_API_URL;

type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };

async function request<T>(action: string, body?: unknown, token?: string): Promise<T> {
  if (!GAS_URL) throw new Error('App server is not configured.');
  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ action, body, ...(token ? { __token: token } : {}) }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as ApiResponse<T>;
    if (!json.ok) throw new Error(json.error);
    return json.data;
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err || '');
    throw new Error(getUserSafeMessageFromText(raw, 'Request failed. Please try again.'));
  }
}

export async function loginWithPhone(payload: LoginPayload): Promise<Partner> {
  if (GAS_URL) return request<Partner>('auth.login', payload);
  return {
    id: 'partner_ahmedabad',
    name: 'SURESHBHAI',
    phone: payload.phone,
    district: 'AHMEDABAD',
    role: 'partner',
    token: 'demo-token',
  };
}

export async function requestPasswordReset(phone: string): Promise<{ requested: boolean; message: string }> {
  if (GAS_URL) return request<{ requested: boolean; message: string }>('auth.passwordResetRequest', { phone });
  return { requested: true, message: 'Password reset request saved' };
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

export async function sendDeliveryOtp(orderId: string, token?: string): Promise<SendDeliveryOtpResult> {
  if (GAS_URL) return request<SendDeliveryOtpResult>('orders.sendDeliveryOtp', { orderId }, token);
  return { sent: true, orderId, statusCode: 200 };
}

export async function startMaskedCall(orderId: string, token?: string): Promise<MaskedCallResult> {
  if (GAS_URL) return request<MaskedCallResult>('calls.startMaskedCall', { orderId }, token);
  return {
    status: 'not_configured',
    message: 'Calling is not configured yet.',
    orderId,
  };
}

export async function markFailed(orderId: string, payload: FailPayload, token?: string) {
  if (GAS_URL) return request<{ updated: true; photoUrl?: string; callRecordingUrl?: string }>('orders.fail', { orderId, ...payload }, token);
  return { updated: true, photoUrl: payload.photoUri };
}

export async function submitSettlement(payload: SettlementPayload, token?: string) {
  if (GAS_URL) return request<{ settlementId: string }>('cod.settle', payload, token);
  return { settlementId: `SET-${Date.now()}` };
}

export async function fetchCodSettlementSummary(payload: { partnerName?: string; partnerPhone?: string; district?: string }, token?: string): Promise<CodSettlementSummary> {
  if (GAS_URL) return request<CodSettlementSummary>('cod.summary', payload, token);
  return {
    assignedCod: 0,
    cashCollected: 0,
    upiCollected: 0,
    commissionEarned: 0,
    payableBeforeSettlement: 0,
    approvedSettled: 0,
    pendingSettlement: 0,
    cashInHand: 0,
    codOrderCount: 0,
    deliveredCodCount: 0,
    pendingCodCount: 0,
  };
}

export async function fetchCodSettlements(token?: string): Promise<CodSettlement[]> {
  if (GAS_URL) return request<CodSettlement[]>('cod.settlements', {}, token);
  return [];
}

export async function approveCodSettlement(payload: {
  settlementId: string;
  status: 'APPROVED' | 'REJECTED';
  approvedAmount?: number;
  method?: 'Cash' | 'UPI' | 'Bank';
  reference?: string;
  adminNotes?: string;
}, token?: string): Promise<{ updated: true }> {
  if (GAS_URL) return request<{ updated: true }>('cod.approveSettlement', payload, token);
  return { updated: true };
}

export async function fetchStockMaster(token?: string): Promise<StockItem[]> {
  if (GAS_URL) return request<StockItem[]>('stock.master', {}, token);
  return [];
}

export async function fetchDeliveryPartners(token?: string): Promise<DeliveryPartnerSummary[]> {
  if (GAS_URL) return request<DeliveryPartnerSummary[]>('admin.partners', {}, token);
  return [];
}

export async function assignOrder(orderId: string, partner: DeliveryPartnerSummary, token?: string): Promise<{ updated: true }> {
  if (GAS_URL) {
    return request<{ updated: true }>('orders.assign', {
      orderId,
      partnerName: partner.name,
      partnerPhone: partner.phone,
      district: partner.district,
    }, token);
  }
  return { updated: true };
}

export async function updatePartnerLocation(payload: PartnerLocationUpdate, token?: string): Promise<{ updated: true; timestamp: string }> {
  if (GAS_URL) return request<{ updated: true; timestamp: string }>('location.update', payload, token);
  return { updated: true, timestamp: new Date().toISOString() };
}

export async function fetchPartnerLiveLocations(token?: string): Promise<PartnerLiveLocation[]> {
  if (GAS_URL) return request<PartnerLiveLocation[]>('location.latest', {}, token);
  return [];
}

export async function addStockDispatch(payload: StockDispatchPayload, token?: string): Promise<{ added: true }> {
  if (GAS_URL) return request<{ added: true }>('stock.dispatch', payload, token);
  return { added: true };
}

export async function registerPushToken(payload: PushTokenRegistration, token?: string): Promise<{ registered: true }> {
  if (GAS_URL) return request<{ registered: true }>('notifications.registerToken', payload, token);
  return { registered: true };
}

export async function deactivatePushToken(expoPushToken: string, token?: string): Promise<{ deactivated: true }> {
  if (GAS_URL) return request<{ deactivated: true }>('notifications.deactivateToken', { expoPushToken }, token);
  return { deactivated: true };
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
