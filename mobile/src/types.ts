import type { NavigatorScreenParams } from '@react-navigation/native';

export type OrderStatus = 'pending' | 'delivered' | 'failed';
export type PaymentType = 'COD' | 'Prepaid';

export type Partner = {
  id: string;
  name: string;
  phone: string;
  district: string;
  role: 'partner' | 'admin' | 'viewer';
  token: string;
};

export type DeliveryOrder = {
  id: string;
  orderNo: string;
  customerName: string;
  phoneMasked: string;
  address: string;
  area: string;
  district: string;
  product: string;
  quantity: number;
  amount: number;
  paymentType: PaymentType;
  status: OrderStatus;
  attempts: number;
  assignedTo: string;
  updatedAt: string;
  photoUrl?: string;
  remarks?: string;
};

export type CodSummary = {
  assigned: number;
  collected: number;
  remaining: number;
  prepaidCount: number;
};

export type StockPartnerBreakdown = {
  name: string;
  numberMasked: string;
  district: string;
  sentQty: number;
  deliveredQty: number;
  pendingQty: number;
  failedQty: number;
  remainingQty: number;
};

export type StockItem = {
  product: string;
  sku: string;
  sentQty: number;
  deliveredQty: number;
  pendingQty: number;
  failedQty: number;
  remainingQty: number;
  sellRate: number;
  daysLeft: number;
  stockPercent: number;
  status: 'critical' | 'low' | 'ok';
  partners: StockPartnerBreakdown[];
};

export type QueueAction =
  | { id: string; type: 'deliver'; orderId: string; payload: DeliverPayload; createdAt: string }
  | { id: string; type: 'fail'; orderId: string; payload: FailPayload; createdAt: string }
  | { id: string; type: 'settle'; orderId: 'cod'; payload: SettlementPayload; createdAt: string };

export type ActionSubmitResult = {
  status: 'synced' | 'queued';
  message: string;
  photoUrl?: string;
};

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'warning' | 'error' | 'offline';

export type SyncMeta = {
  status: SyncStatus;
  message: string;
  lastSyncAt?: string;
  lastError?: string;
};

export type SyncQueueResult = {
  synced: number;
  remaining: number;
  failed: number;
  status: Exclude<SyncStatus, 'idle' | 'syncing'>;
  message: string;
};

export type DeliverPayload = {
  codCollected: number;
  photoUri?: string;
  photoBase64?: string;
  photoMimeType?: string;
  photoFileName?: string;
  otp: string;
  notes?: string;
};

export type FailPayload = {
  reason: string;
  notes?: string;
  nextAttemptDate?: string;
  photoUri?: string;
  photoMimeType?: string;
  photoFileName?: string;
};

export type SettlementPayload = {
  amount: number;
  method: 'Cash' | 'UPI' | 'Bank';
  reference?: string;
  partnerName?: string;
  partnerPhone?: string;
  district?: string;
  assignedCod?: number;
  collectedCod?: number;
  remainingCod?: number;
  codOrderCount?: number;
  deliveredCodCount?: number;
  pendingCodCount?: number;
};

export type TabParamList = {
  Home: undefined;
  Orders: undefined;
  COD: undefined;
  Profile: undefined;
};

export type AdminTabParamList = {
  AdminHome: undefined;
  AdminOrders: undefined;
  AdminMap: undefined;
  AdminEarnings: undefined;
  AdminStock: undefined;
  AdminProfile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Tabs: NavigatorScreenParams<TabParamList>;
  AdminTabs: NavigatorScreenParams<AdminTabParamList>;
  OrderDetail: { orderId: string };
  Delivery: { orderId: string };
  FailedDelivery: { orderId: string };
};
