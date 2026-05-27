import type { NavigatorScreenParams } from '@react-navigation/native';

export type OrderStatus = 'pending' | 'delivered' | 'failed';
export type PaymentType = 'COD' | 'Prepaid';
export type PaymentReceivedMode = 'Cash' | 'UPI QR' | 'Prepaid';
export type DeadlineStatus = 'normal' | 'due_today' | 'overdue' | 'unplanned';

export type Partner = {
  id: string;
  name: string;
  phone: string;
  district: string;
  role: 'partner' | 'admin' | 'viewer';
  token: string;
};

export type DeliveryPartnerSummary = {
  name: string;
  phone?: string;
  numberMasked?: string;
  district: string;
  status?: string;
  orderCount?: number;
};

export type PartnerLocationUpdate = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  speed?: number | null;
  heading?: number | null;
  appVersion?: string;
  source?: string;
};

export type PartnerLiveLocation = {
  partnerName: string;
  phone: string;
  numberMasked: string;
  district: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  lastSeen: string;
  source?: string;
};

export type LoginPayload = {
  phone: string;
  password?: string;
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
  orderDate?: string;
  plannedDeliveryDate?: string;
  deliveryDeadline?: string;
  hoursLeft?: number;
  deadlineStatus?: DeadlineStatus;
  deliveryDate?: string;
  updatedAt: string;
  photoUrl?: string;
  deliveryOtpSentStatus?: string;
  remarks?: string;
};

export type CodSummary = {
  assigned: number;
  collected: number;
  remaining: number;
  prepaidCount: number;
};

export type CodSettlementSummary = {
  assignedCod: number;
  cashCollected: number;
  upiCollected: number;
  commissionEarned: number;
  payableBeforeSettlement: number;
  approvedSettled: number;
  pendingSettlement: number;
  cashInHand: number;
  codOrderCount: number;
  deliveredCodCount: number;
  pendingCodCount: number;
};

export type CodSettlement = {
  settlementId: string;
  timestamp: string;
  partnerName: string;
  partnerPhone: string;
  district: string;
  requestedAmount: number;
  approvedAmount: number;
  method: 'Cash' | 'UPI' | 'Bank' | '';
  reference?: string;
  paymentProofUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  cashInHand: number;
  commissionEarned?: number;
  payableBeforeSettlement?: number;
  approvedBy?: string;
  approvedAt?: string;
  adminNotes?: string;
};

export type StockPartnerBreakdown = {
  name: string;
  numberMasked: string;
  district: string;
  scopeType?: 'PARTNER' | 'LOCATION';
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

export type StockDispatchPayload = {
  product: string;
  quantity: number;
  partnerName?: string;
  partnerPhone?: string;
  district?: string;
  notes?: string;
};

export type StockReorderItem = {
  product: string;
  sku?: string;
  remainingQty: number;
  daysLeft: number;
  status: 'critical' | 'low' | 'ok';
};

export type StockReorderPayload = {
  items: StockReorderItem[];
  requestedBy?: string;
  notes?: string;
};

export type StockPhotoProofImage = {
  photoBase64: string;
  photoMimeType?: string;
  photoFileName?: string;
};

export type StockPhotoSubmitPayload = {
  photos: StockPhotoProofImage[];
  latitude?: number | null;
  longitude?: number | null;
  accuracy?: number | null;
  notes?: string;
};

export type StockPhotoStatus = {
  proofDate: string;
  submitted: boolean;
  photoCount: number;
  submittedAt?: string;
  status?: 'PENDING' | 'SUBMITTED';
  photoUrls?: string[];
};

export type StockPhotoLog = {
  submittedAt: string;
  proofDate: string;
  partnerName: string;
  partnerPhone: string;
  district: string;
  photoCount: number;
  photoUrls: string[];
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  status: 'PENDING' | 'SUBMITTED' | string;
  notes?: string;
};

export type PushTokenRegistration = {
  expoPushToken: string;
  userId: string;
  role: Partner['role'];
  phone: string;
  partnerName: string;
  district: string;
  platform: string;
  deviceName?: string;
  appVersion?: string;
};

export type PushRegistrationStatus = {
  status: 'idle' | 'registered' | 'skipped' | 'error';
  message: string;
  tokenPreview?: string;
  updatedAt?: string;
};

export type QueueAction =
  | { id: string; type: 'deliver'; orderId: string; payload: DeliverPayload; createdAt: string; ownerId?: string; ownerRole?: Partner['role'] }
  | { id: string; type: 'fail'; orderId: string; payload: FailPayload; createdAt: string; ownerId?: string; ownerRole?: Partner['role'] }
  | { id: string; type: 'settle'; orderId: 'cod'; payload: SettlementPayload; createdAt: string; ownerId?: string; ownerRole?: Partner['role'] };

export type ActionSubmitResult = {
  status: 'synced' | 'queued';
  message: string;
  photoUrl?: string;
};

export type SendDeliveryOtpResult = {
  sent: boolean;
  orderId?: string;
  statusCode?: number;
};

export type MaskedCallResult = {
  status: 'initiated' | 'not_configured' | 'failed';
  message: string;
  orderId?: string;
  maskedNumber?: string;
  providerCallId?: string;
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
  paymentReceivedMode?: PaymentReceivedMode;
  paymentReference?: string;
  paymentReceivedAmount?: number;
  photoUri?: string;
  photoBase64?: string;
  photoMimeType?: string;
  photoFileName?: string;
  uploadProof?: boolean;
  otp: string;
  notes?: string;
};

export type FailPayload = {
  reason: string;
  notes?: string;
  nextAttemptDate?: string;
  photoUri?: string;
  photoBase64?: string;
  photoMimeType?: string;
  photoFileName?: string;
  uploadProof?: boolean;
  callRecordingUri?: string;
  callRecordingBase64?: string;
  callRecordingMimeType?: string;
  callRecordingFileName?: string;
  uploadCallRecording?: boolean;
};

export type SettlementPayload = {
  amount: number;
  method: 'Cash' | 'UPI' | 'Bank';
  reference?: string;
  photoUri?: string;
  photoBase64?: string;
  photoMimeType?: string;
  photoFileName?: string;
  partnerName?: string;
  partnerPhone?: string;
  district?: string;
  assignedCod?: number;
  collectedCod?: number;
  commissionEarned?: number;
  payableBeforeSettlement?: number;
  remainingCod?: number;
  codOrderCount?: number;
  deliveredCodCount?: number;
  pendingCodCount?: number;
  cashInHand?: number;
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
