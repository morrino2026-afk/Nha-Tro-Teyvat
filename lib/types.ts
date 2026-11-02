export type OrderStatus = 'awaiting_payment' | 'pending' | 'processing' | 'completed' | 'cancelled';
export type TopupStatus = 'pending' | 'approved' | 'rejected';
export type PaymentMethod = 'balance' | 'transfer';

export interface Profile {
  uid: string;
  accountId: string;
  email: string;
  displayName: string;
  balance: number;
  createdAt: string;
  isAdmin: boolean;
}

export interface OrderItem {
  serviceId: string;
  serviceName: string;
  packageId: string;
  packageName: string;
  price: number;
}

export interface Order {
  id: string;
  code: string;
  uid: string;
  email: string;
  serviceId: string;
  serviceName: string;
  packageId: string;
  packageName: string;
  price: number;
  /** Các gói trong đơn (đơn gộp combo sẽ có nhiều hơn 1). */
  items: OrderItem[];
  gameUid: string;
  gameServer: string;
  gameName: string;
  note: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Topup {
  id: string;
  code: string;
  uid: string;
  email: string;
  amount: number;
  method: string;
  note: string;
  status: TopupStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MailPreview {
  id: string;
  to: string;
  subject: string;
  createdAt: string;
}
