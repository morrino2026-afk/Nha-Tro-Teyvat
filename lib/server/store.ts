import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { formatVnd } from '../catalog';
import type { Order, OrderItem, OrderStatus, PaymentMethod, Profile, Topup } from '../types';
import { adminDb } from './firebase';
import { AppError, checkIsAdmin, type AuthUser } from './http';
import { ACCOUNT_IDS, ACCOUNT_ID_PATTERN, reserveAccountId } from './account-id';

const ORDERS = 'orders';
const TOPUPS = 'topups';
const USERS = 'users';

function iso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

function toProfile(uid: string, data: FirebaseFirestore.DocumentData | undefined, email: string): Profile {
  return {
    uid,
    accountId: data?.accountId || '',
    email: data?.email || email,
    displayName: data?.displayName || email.split('@')[0] || 'Người chơi',
    balance: Number(data?.balance || 0),
    createdAt: iso(data?.createdAt),
    isAdmin: checkIsAdmin(data?.email || email),
  };
}

export async function ensureProfile(user: AuthUser): Promise<Profile> {
  const db = adminDb();
  const ref = db.collection(USERS).doc(user.uid);
  const data = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) {
      const accountId = await reserveAccountId(db, transaction, user.uid);
      const newProfile = {
        accountId,
        email: user.email,
        displayName: user.name,
        balance: 0,
        createdAt: FieldValue.serverTimestamp(),
      };
      transaction.set(ref, newProfile);
      return newProfile;
    }
    const profile = snapshot.data()!;
    const currentAccountId =
      typeof profile.accountId === 'string' && ACCOUNT_ID_PATTERN.test(profile.accountId)
        ? profile.accountId
        : '';
    if (currentAccountId) {
      const accountIdRef = db.collection(ACCOUNT_IDS).doc(currentAccountId);
      const accountIdSnapshot = await transaction.get(accountIdRef);
      if (!accountIdSnapshot.exists || accountIdSnapshot.data()?.uid === user.uid) {
        if (!accountIdSnapshot.exists) transaction.create(accountIdRef, { uid: user.uid });
        if (profile.accountId !== currentAccountId) {
          transaction.update(ref, { accountId: currentAccountId });
        }
        return { ...profile, accountId: currentAccountId };
      }
    }
    const accountId = await reserveAccountId(db, transaction, user.uid);
    if (profile.accountId !== accountId) {
      transaction.update(ref, { accountId });
    }
    return { ...profile, accountId };
  });
  return toProfile(user.uid, data, user.email);
}

export async function updateDisplayName(uid: string, displayName: string): Promise<void> {
  const clean = displayName.trim().slice(0, 40);
  if (!clean) throw new AppError(400, 'Tên hiển thị không hợp lệ.');
  await adminDb().collection(USERS).doc(uid).update({ displayName: clean });
}

function orderCode(serviceId: string, combo = false): string {
  const prefix = combo ? 'CB' : serviceId === 'abyss' ? 'LH' : serviceId === 'theater' ? 'NH' : 'AC';
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${random}`;
}

function joinServices(items: OrderItem[]): string {
  return Array.from(new Set(items.map((item) => item.serviceName))).join(' + ');
}

function joinPackages(items: OrderItem[]): string {
  return items.map((item) => item.packageName).join(' + ');
}

function topupCode(): string {
  return `NAP-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export interface CreateOrderInput {
  items: OrderItem[];
  gameUid: string;
  gameServer: string;
  gameName: string;
  note: string;
  paymentMethod: PaymentMethod;
}

export async function createOrder(user: AuthUser, input: CreateOrderInput): Promise<Order> {
  if (!input.items.length) throw new AppError(400, 'Vui lòng chọn ít nhất một gói dịch vụ.');
  if (!input.gameUid.trim()) throw new AppError(400, 'Vui lòng nhập UID trong game.');

  const first = input.items[0];
  const price = input.items.reduce((sum, item) => sum + Number(item.price || 0), 0);
  if (!Number.isFinite(price) || price <= 0) throw new AppError(400, 'Giá gói không hợp lệ.');

  const db = adminDb();
  const userRef = db.collection(USERS).doc(user.uid);
  const orderRef = db.collection(ORDERS).doc();
  const now = new Date();

  const order: Order = {
    id: orderRef.id,
    code: orderCode(first.serviceId, input.items.length > 1),
    uid: user.uid,
    email: user.email,
    serviceId: first.serviceId,
    serviceName: joinServices(input.items),
    packageId: first.packageId,
    packageName: joinPackages(input.items),
    price,
    items: input.items,
    gameUid: input.gameUid.trim(),
    gameServer: input.gameServer,
    gameName: input.gameName.trim(),
    note: input.note.trim().slice(0, 500),
    paymentMethod: input.paymentMethod,
    status: input.paymentMethod === 'balance' ? 'pending' : 'awaiting_payment',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  await db.runTransaction(async (tx) => {
    const snapshot = await tx.get(userRef);
    const balance = Number(snapshot.data()?.balance || 0);
    if (input.paymentMethod === 'balance') {
      if (balance < price) {
        throw new AppError(
          400,
          `Số dư không đủ (hiện có ${formatVnd(balance)}). Vui lòng nạp thêm hoặc chọn chuyển khoản.`,
        );
      }
      tx.update(userRef, { balance: balance - price });
    }
    tx.set(orderRef, {
      ...order,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  return order;
}

function toOrder(id: string, data: FirebaseFirestore.DocumentData): Order {
  const items: OrderItem[] =
    Array.isArray(data.items) && data.items.length
      ? data.items
      : [
          {
            serviceId: data.serviceId || '',
            serviceName: data.serviceName || '',
            packageId: data.packageId || '',
            packageName: data.packageName || '',
            price: Number(data.price || 0),
          },
        ];
  return {
    id,
    code: data.code || id,
    uid: data.uid || '',
    email: data.email || '',
    serviceId: data.serviceId || '',
    serviceName: data.serviceName || '',
    packageId: data.packageId || '',
    packageName: data.packageName || '',
    price: Number(data.price || 0),
    items,
    gameUid: data.gameUid || '',
    gameServer: data.gameServer || '',
    gameName: data.gameName || '',
    note: data.note || '',
    paymentMethod: data.paymentMethod === 'balance' ? 'balance' : 'transfer',
    status: (data.status as OrderStatus) || 'pending',
    createdAt: iso(data.createdAt),
    updatedAt: iso(data.updatedAt),
  };
}

export async function listOrders(uid: string, limit = 60): Promise<Order[]> {
  const snapshot = await adminDb().collection(ORDERS).where('uid', '==', uid).limit(limit).get();
  return snapshot.docs
    .map((doc) => toOrder(doc.id, doc.data()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listAllOrders(limit = 100): Promise<Order[]> {
  const snapshot = await adminDb().collection(ORDERS).orderBy('createdAt', 'desc').limit(limit).get();
  return snapshot.docs.map((doc) => toOrder(doc.id, doc.data()));
}

export async function setOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const allowed: OrderStatus[] = ['awaiting_payment', 'pending', 'processing', 'completed', 'cancelled'];
  if (!allowed.includes(status)) throw new AppError(400, 'Trạng thái đơn không hợp lệ.');
  const ref = adminDb().collection(ORDERS).doc(id);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new AppError(404, 'Không tìm thấy đơn hàng.');
  await ref.update({ status, updatedAt: FieldValue.serverTimestamp() });
}

export async function getOrder(id: string): Promise<Order | null> {
  const snapshot = await adminDb().collection(ORDERS).doc(id).get();
  return snapshot.exists ? toOrder(snapshot.id, snapshot.data()!) : null;
}

function toTopup(id: string, data: FirebaseFirestore.DocumentData): Topup {
  return {
    id,
    code: data.code || id,
    uid: data.uid || '',
    email: data.email || '',
    amount: Number(data.amount || 0),
    method: data.method || 'Chuyển khoản ngân hàng',
    note: data.note || '',
    status: data.status === 'approved' || data.status === 'rejected' ? data.status : 'pending',
    createdAt: iso(data.createdAt),
    updatedAt: iso(data.updatedAt),
  };
}

export async function createTopup(
  user: AuthUser,
  amount: number,
  note: string,
): Promise<Topup> {
  if (!Number.isFinite(amount) || amount < 20000) {
    throw new AppError(400, 'Số tiền nạp tối thiểu là 20.000đ.');
  }
  if (amount > 20000000) throw new AppError(400, 'Vui lòng liên hệ trực tiếp cho giao dịch trên 20.000.000đ.');

  const ref = adminDb().collection(TOPUPS).doc();
  const now = new Date();
  const topup: Topup = {
    id: ref.id,
    code: topupCode(),
    uid: user.uid,
    email: user.email,
    amount: Math.round(amount),
    method: 'Chuyển khoản ngân hàng',
    note: note.trim().slice(0, 300),
    status: 'pending',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  await ref.set({ ...topup, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  return topup;
}

export async function listTopups(uid: string, limit = 60): Promise<Topup[]> {
  const snapshot = await adminDb().collection(TOPUPS).where('uid', '==', uid).limit(limit).get();
  return snapshot.docs
    .map((doc) => toTopup(doc.id, doc.data()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listAllTopups(limit = 100): Promise<Topup[]> {
  const snapshot = await adminDb().collection(TOPUPS).orderBy('createdAt', 'desc').limit(limit).get();
  return snapshot.docs.map((doc) => toTopup(doc.id, doc.data()));
}

export async function getTopup(id: string): Promise<Topup | null> {
  const snapshot = await adminDb().collection(TOPUPS).doc(id).get();
  return snapshot.exists ? toTopup(snapshot.id, snapshot.data()!) : null;
}

export async function approveTopup(id: string): Promise<void> {
  const db = adminDb();
  const ref = db.collection(TOPUPS).doc(id);
  await db.runTransaction(async (tx) => {
    const snapshot = await tx.get(ref);
    if (!snapshot.exists) throw new AppError(404, 'Không tìm thấy giao dịch.');
    const data = snapshot.data()!;
    if (data.status === 'approved') throw new AppError(400, 'Giao dịch này đã được duyệt trước đó.');
    if (data.status === 'rejected') throw new AppError(400, 'Giao dịch này đã bị từ chối.');
    const userRef = db.collection(USERS).doc(data.uid);
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists) throw new AppError(404, 'Không tìm thấy người dùng của giao dịch.');
    const balance = Number(userSnap.data()?.balance || 0);
    tx.update(userRef, { balance: balance + Number(data.amount || 0) });
    tx.update(ref, { status: 'approved', updatedAt: FieldValue.serverTimestamp() });
  });
}

export async function rejectTopup(id: string): Promise<void> {
  const ref = adminDb().collection(TOPUPS).doc(id);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new AppError(404, 'Không tìm thấy giao dịch.');
  if (snapshot.data()?.status === 'approved') {
    throw new AppError(400, 'Giao dịch đã được duyệt, không thể từ chối.');
  }
  await ref.update({ status: 'rejected', updatedAt: FieldValue.serverTimestamp() });
}
