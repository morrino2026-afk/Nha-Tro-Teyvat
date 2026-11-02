import type { Order, OrderItem, OrderStatus, PaymentMethod, Profile, Topup } from './types';

const KEY = 'vongnguyet.demo.v1';
const SESSION = 'vongnguyet.demo.session';

interface DemoUser {
  uid: string;
  email: string;
  name: string;
  password: string;
}

interface DemoOrder extends Order {
  paymentMethod: PaymentMethod;
}

interface DemoDB {
  users: DemoUser[];
  orders: DemoOrder[];
  topups: Topup[];
  otps: Record<string, { code: string; expiresAt: number; attempts: number }>;
}

function nowIso(offsetMs = 0) {
  return new Date(Date.now() - offsetMs).toISOString();
}

function seed(): DemoDB {
  const adminUid = 'demo-admin';
  return {
    users: [{ uid: adminUid, email: 'admin@demo.vn', name: 'Quản trị viên', password: '123456' }],
    orders: [
      {
        id: 'o-demo-1',
        code: 'LH-8K2QP',
        uid: adminUid,
        email: 'admin@demo.vn',
        serviceId: 'abyss',
        serviceName: 'La Hoàn Thâm Cảnh',
        packageId: 'abyss-full',
        packageName: 'Full 36★ · Tầng 9 – 12',
        price: 250000,
        items: [
          {
            serviceId: 'abyss',
            serviceName: 'La Hoàn Thâm Cảnh',
            packageId: 'abyss-full',
            packageName: 'Full 36★ · Tầng 9 – 12',
            price: 250000,
          },
        ],
        gameUid: '801234567',
        gameServer: 'Asia',
        gameName: 'Lumine',
        note: 'Ưu tiên đội hình Raiden – Nahida',
        paymentMethod: 'balance',
        status: 'completed',
        createdAt: nowIso(1000 * 60 * 60 * 48),
        updatedAt: nowIso(1000 * 60 * 46),
      },
      {
        id: 'o-demo-2',
        code: 'NH-4M1XZ',
        uid: adminUid,
        email: 'admin@demo.vn',
        serviceId: 'theater',
        serviceName: 'Nhà Hát Kịch Ảo Tưởng',
        packageId: 'theater-full',
        packageName: 'Full 10 màn + Màn kết',
        price: 290000,
        items: [
          {
            serviceId: 'theater',
            serviceName: 'Nhà Hát Kịch Ảo Tưởng',
            packageId: 'theater-full',
            packageName: 'Full 10 màn + Màn kết',
            price: 290000,
          },
        ],
        gameUid: '801234567',
        gameServer: 'Asia',
        gameName: 'Lumine',
        note: '',
        paymentMethod: 'balance',
        status: 'processing',
        createdAt: nowIso(1000 * 60 * 60 * 5),
        updatedAt: nowIso(1000 * 60 * 60 * 2),
      },
    ],
    topups: [
      {
        id: 't-demo-0',
        code: 'NAP-7KD3M',
        uid: adminUid,
        email: 'admin@demo.vn',
        amount: 1000000,
        method: 'Chuyển khoản ngân hàng',
        note: 'Nạp ví tháng 10',
        status: 'approved',
        createdAt: nowIso(1000 * 60 * 60 * 96),
        updatedAt: nowIso(1000 * 60 * 60 * 95),
      },
      {
        id: 't-demo-1',
        code: 'NAP-9F2LK',
        uid: adminUid,
        email: 'admin@demo.vn',
        amount: 500000,
        method: 'Chuyển khoản ngân hàng',
        note: '',
        status: 'approved',
        createdAt: nowIso(1000 * 60 * 60 * 50),
        updatedAt: nowIso(1000 * 60 * 60 * 49),
      },
      {
        id: 't-demo-2',
        code: 'NAP-1QW7B',
        uid: adminUid,
        email: 'admin@demo.vn',
        amount: 200000,
        method: 'Chuyển khoản ngân hàng',
        note: 'Nạp thêm để đặt combo',
        status: 'pending',
        createdAt: nowIso(1000 * 60 * 90),
        updatedAt: nowIso(1000 * 60 * 90),
      },
    ],
    otps: {},
  };
}

function read(): DemoDB {
  if (typeof window === 'undefined') return seed();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const fresh = seed();
      window.localStorage.setItem(KEY, JSON.stringify(fresh));
      return fresh;
    }
    const parsed = JSON.parse(raw) as DemoDB;
    parsed.users ||= [];
    parsed.orders ||= [];
    parsed.topups ||= [];
    parsed.otps ||= {};
    return parsed;
  } catch {
    return seed();
  }
}

function write(db: DemoDB) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(db));
}

const delay = (ms = 260) => new Promise((resolve) => setTimeout(resolve, ms));

function randomCode(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export interface DemoSessionUser {
  uid: string;
  email: string;
  displayName: string;
}

export function demoSession(): DemoSessionUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION);
    return raw ? (JSON.parse(raw) as DemoSessionUser) : null;
  } catch {
    return null;
  }
}

function setSession(user: DemoSessionUser | null) {
  if (typeof window === 'undefined') return;
  if (user) window.localStorage.setItem(SESSION, JSON.stringify(user));
  else window.localStorage.removeItem(SESSION);
}

function requireSession(): DemoSessionUser {
  const session = demoSession();
  if (!session) throw new Error('Bạn cần đăng nhập để tiếp tục.');
  return session;
}

export async function demoSignIn(email: string, password: string): Promise<DemoSessionUser> {
  await delay();
  const db = read();
  const user = db.users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || user.password !== password) throw new Error('Email hoặc mật khẩu không đúng.');
  const session = { uid: user.uid, email: user.email, displayName: user.name };
  setSession(session);
  return session;
}

export async function demoSignUp(email: string, password: string, name: string): Promise<DemoSessionUser> {
  await delay();
  const db = read();
  const normalized = email.trim().toLowerCase();
  if (db.users.some((item) => item.email.toLowerCase() === normalized)) {
    throw new Error('Email này đã được sử dụng.');
  }
  const user: DemoUser = {
    uid: `demo-${Math.random().toString(36).slice(2, 10)}`,
    email: normalized,
    name: name.trim() || normalized.split('@')[0],
    password,
  };
  db.users.push(user);
  write(db);
  const session = { uid: user.uid, email: user.email, displayName: user.name };
  setSession(session);
  return session;
}

export async function demoGoogle(): Promise<DemoSessionUser> {
  await delay(400);
  const db = read();
  const email = 'traveler.demo@gmail.com';
  let user = db.users.find((item) => item.email === email);
  if (!user) {
    user = { uid: 'demo-google', email, name: 'Nhà Lữ Hành', password: '' };
    db.users.push(user);
    write(db);
  }
  const session = { uid: user.uid, email: user.email, displayName: user.name };
  setSession(session);
  return session;
}

export function demoSignOut() {
  setSession(null);
}

export async function demoProfile(): Promise<Profile> {
  await delay(120);
  const session = requireSession();
  const profile = buildProfile(session);
  return profile;
}

function buildProfile(session: DemoSessionUser): Profile {
  const db = read();
  const user = db.users.find((item) => item.uid === session.uid);
  const paid = db.orders
    .filter((order) => order.uid === session.uid)
    .reduce((sum, order) => sum + order.price, 0);
  const approvedTopups = db.topups
    .filter((topup) => topup.uid === session.uid && topup.status === 'approved')
    .reduce((sum, topup) => sum + topup.amount, 0);
  return {
    uid: session.uid,
    accountId: session.uid === 'demo-admin' ? 'AD1001' : 'US1001',
    email: user?.email || session.email,
    displayName: user?.name || session.displayName,
    balance: Math.max(approvedTopups - paid, 0),
    createdAt: new Date().toISOString(),
    isAdmin: (user?.email || session.email).toLowerCase().startsWith('admin'),
  };
}

export async function demoListOrders(): Promise<Order[]> {
  await delay(140);
  const session = requireSession();
  return read()
    .orders.filter((order) => order.uid === session.uid)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function demoCreateOrder(input: {
  items: OrderItem[];
  gameUid: string;
  gameServer: string;
  gameName: string;
  note: string;
  paymentMethod: PaymentMethod;
}): Promise<Order> {
  await delay(500);
  const session = requireSession();
  const db = read();
  const profile = buildProfile(session);
  const items = input.items;
  if (!items.length) throw new Error('Vui lòng chọn ít nhất một gói dịch vụ.');
  const price = items.reduce((sum, item) => sum + item.price, 0);
  if (input.paymentMethod === 'balance' && profile.balance < price) {
    throw new Error('Số dư không đủ, vui lòng nạp thêm hoặc chọn chuyển khoản.');
  }
  const first = items[0];
  const combo = items.length > 1;
  const prefix = combo ? 'CB' : first.serviceId === 'abyss' ? 'LH' : first.serviceId === 'theater' ? 'NH' : 'AC';
  const order: DemoOrder = {
    id: `o-${Date.now()}`,
    code: randomCode(prefix),
    uid: session.uid,
    email: session.email,
    serviceId: first.serviceId,
    serviceName: Array.from(new Set(items.map((item) => item.serviceName))).join(' + '),
    packageId: first.packageId,
    packageName: items.map((item) => item.packageName).join(' + '),
    price,
    items,
    gameUid: input.gameUid,
    gameServer: input.gameServer,
    gameName: input.gameName,
    note: input.note,
    paymentMethod: input.paymentMethod,
    status: input.paymentMethod === 'balance' ? 'pending' : 'awaiting_payment',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.orders.unshift(order);
  write(db);
  return order;
}

export async function demoListTopups(): Promise<Topup[]> {
  await delay(140);
  const session = requireSession();
  return read()
    .topups.filter((topup) => topup.uid === session.uid)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function demoCreateTopup(amount: number, note: string): Promise<Topup> {
  await delay(400);
  const session = requireSession();
  if (!amount || amount < 20000) throw new Error('Số tiền nạp tối thiểu là 20.000đ.');
  const db = read();
  const topup: Topup = {
    id: `t-${Date.now()}`,
    code: randomCode('NAP'),
    uid: session.uid,
    email: session.email,
    amount,
    method: 'Chuyển khoản ngân hàng',
    note,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.topups.unshift(topup);
  write(db);
  return topup;
}

export async function demoUpdateName(displayName: string): Promise<Profile> {
  await delay(200);
  const session = requireSession();
  const db = read();
  const user = db.users.find((item) => item.uid === session.uid);
  if (user) user.name = displayName.trim();
  write(db);
  setSession({ ...session, displayName: displayName.trim() });
  return buildProfile(session);
}

export async function demoAdminData() {
  await delay(220);
  const profile = buildProfile(requireSession());
  if (!profile.isAdmin) throw new Error('Bạn không có quyền truy cập trang quản trị.');
  const db = read();
  const orders = [...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const topups = [...db.topups].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return {
    orders,
    topups,
    stats: {
      revenue: orders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.price, 0),
      activeOrders: orders.filter((o) => o.status === 'pending' || o.status === 'processing').length,
      pendingTopups: topups.filter((t) => t.status === 'pending').length,
      totalOrders: orders.length,
    },
  };
}

export async function demoSetOrderStatus(id: string, status: OrderStatus) {
  await delay(180);
  const db = read();
  const order = db.orders.find((item) => item.id === id);
  if (!order) throw new Error('Không tìm thấy đơn hàng.');
  order.status = status;
  order.updatedAt = new Date().toISOString();
  write(db);
}

export async function demoApproveTopup(id: string) {
  await delay(180);
  const db = read();
  const topup = db.topups.find((item) => item.id === id);
  if (!topup) throw new Error('Không tìm thấy giao dịch.');
  if (topup.status === 'approved') throw new Error('Giao dịch đã được duyệt.');
  topup.status = 'approved';
  topup.updatedAt = new Date().toISOString();
  write(db);
}

export async function demoRejectTopup(id: string) {
  await delay(180);
  const db = read();
  const topup = db.topups.find((item) => item.id === id);
  if (!topup) throw new Error('Không tìm thấy giao dịch.');
  topup.status = 'rejected';
  topup.updatedAt = new Date().toISOString();
  write(db);
}

export async function demoSendOtp(email: string): Promise<{ devCode?: string }> {
  await delay(500);
  const db = read();
  const user = db.users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) return {};
  const code = String(Math.floor(100000 + Math.random() * 900000));
  db.otps[user.uid] = { code, expiresAt: Date.now() + 10 * 60 * 1000, attempts: 0 };
  write(db);
  return { devCode: code };
}

export async function demoResetPassword(email: string, code: string, password: string) {
  await delay(400);
  const db = read();
  const user = db.users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) throw new Error('Mã OTP không đúng hoặc đã hết hạn.');
  const entry = db.otps[user.uid];
  if (!entry || entry.expiresAt < Date.now()) throw new Error('Mã OTP đã hết hạn, vui lòng yêu cầu mã mới.');
  if (entry.attempts >= 5) throw new Error('Bạn đã nhập sai quá nhiều lần, hãy yêu cầu mã mới.');
  if (entry.code !== code.trim()) {
    entry.attempts += 1;
    write(db);
    throw new Error('Mã OTP không đúng.');
  }
  if (password.length < 6) throw new Error('Mật khẩu phải có ít nhất 6 ký tự.');
  user.password = password;
  delete db.otps[user.uid];
  write(db);
}

export function demoResetAll() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
  window.localStorage.removeItem(SESSION);
}
