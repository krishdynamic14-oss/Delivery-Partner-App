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

export type QueueAction =
  | { id: string; type: 'deliver'; orderId: string; payload: DeliverPayload; createdAt: string }
  | { id: string; type: 'fail'; orderId: string; payload: FailPayload; createdAt: string }
  | { id: string; type: 'settle'; orderId: 'cod'; payload: SettlementPayload; createdAt: string };

export type DeliverPayload = {
  codCollected: number;
  photoUri?: string;
  otp: string;
  notes?: string;
};

export type FailPayload = {
  reason: string;
  notes?: string;
  nextAttemptDate?: string;
};

export type SettlementPayload = {
  amount: number;
  method: 'Cash' | 'UPI' | 'Bank';
  reference?: string;
};

export type TabParamList = {
  Home: undefined;
  Orders: undefined;
  COD: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Tabs: NavigatorScreenParams<TabParamList>;
  OrderDetail: { orderId: string };
  Delivery: { orderId: string };
  FailedDelivery: { orderId: string };
};
