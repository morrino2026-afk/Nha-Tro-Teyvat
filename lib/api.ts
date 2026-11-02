import {
  demoAdminData,
  demoApproveTopup,
  demoCreateOrder,
  demoCreateTopup,
  demoGoogle,
  demoListOrders,
  demoListTopups,
  demoProfile,
  demoRejectTopup,
  demoResetPassword,
  demoSendOtp,
  demoSetOrderStatus,
  demoSignIn,
  demoSignOut,
  demoSignUp,
  demoUpdateName,
  type DemoSessionUser,
} from './demo';
import { DEMO_MODE, firebaseAuth } from './firebaseClient';
import type { Order, OrderItem, OrderStatus, PaymentMethod, Profile, Topup } from './types';

export interface SessionUser {
  uid: string;
  email: string;
  displayName: string;
}

export interface AdminData {
  orders: Order[];
  topups: Topup[];
  stats: { revenue: number; activeOrders: number; pendingTopups: number; totalOrders: number };
}

async function token(): Promise<string> {
  const user = firebaseAuth().currentUser;
  if (!user) throw new Error('Bạn cần đăng nhập để tiếp tục.');
  return user.getIdToken();
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { ...(init?.headers as Record<string, string>) };
  if (init?.body) headers['Content-Type'] = 'application/json';
  if (!DEMO_MODE) headers.Authorization = `Bearer ${await token()}`;

  const response = await fetch(url, { ...init, headers, cache: 'no-store' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data as { error?: string }).error || 'Không thể kết nối máy chủ.');
  }
  return data as T;
}

function toSession(user: DemoSessionUser): SessionUser {
  return { uid: user.uid, email: user.email, displayName: user.displayName };
}

/* ----------------------------- Auth ----------------------------- */

export async function signInEmail(email: string, password: string): Promise<SessionUser | null> {
  if (DEMO_MODE) return toSession(await demoSignIn(email, password));
  const { signInWithEmailAndPassword } = await import('firebase/auth');
  const credential = await signInWithEmailAndPassword(firebaseAuth(), email.trim(), password);
  return {
    uid: credential.user.uid,
    email: credential.user.email || email,
    displayName: credential.user.displayName || email.split('@')[0],
  };
}

export async function signUpEmail(email: string, password: string, name: string): Promise<SessionUser | null> {
  if (DEMO_MODE) return toSession(await demoSignUp(email, password, name));
  const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
  const credential = await createUserWithEmailAndPassword(firebaseAuth(), email.trim(), password);
  if (name.trim()) await updateProfile(credential.user, { displayName: name.trim() });
  return {
    uid: credential.user.uid,
    email: credential.user.email || email,
    displayName: name.trim() || email.split('@')[0],
  };
}

export async function signInGoogle(): Promise<SessionUser | null> {
  if (DEMO_MODE) return toSession(await demoGoogle());
  const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const credential = await signInWithPopup(firebaseAuth(), provider);
  return {
    uid: credential.user.uid,
    email: credential.user.email || '',
    displayName: credential.user.displayName || '',
  };
}

export async function signOut(): Promise<void> {
  if (DEMO_MODE) {
    demoSignOut();
    return;
  }
  const { signOut: firebaseSignOut } = await import('firebase/auth');
  await firebaseSignOut(firebaseAuth());
}

/* ---------------------------- Profile ---------------------------- */

export async function getProfile(): Promise<Profile> {
  if (DEMO_MODE) return demoProfile();
  const { profile } = await request<{ profile: Profile }>('/api/me');
  return profile;
}

export async function saveDisplayName(displayName: string): Promise<Profile> {
  if (DEMO_MODE) return demoUpdateName(displayName);
  const { profile } = await request<{ profile: Profile }>('/api/me', {
    method: 'PATCH',
    body: JSON.stringify({ displayName }),
  });
  return profile;
}

/* ----------------------------- Orders ---------------------------- */

export async function fetchOrders(): Promise<Order[]> {
  if (DEMO_MODE) return demoListOrders();
  const { orders } = await request<{ orders: Order[] }>('/api/orders');
  return orders;
}

export interface CreateOrderPayload {
  items: OrderItem[];
  gameUid: string;
  gameServer: string;
  gameName: string;
  note: string;
  paymentMethod: PaymentMethod;
}

export async function placeOrder(payload: CreateOrderPayload): Promise<Order> {
  if (DEMO_MODE) return demoCreateOrder(payload);
  const { order } = await request<{ order: Order }>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return order;
}

/* ----------------------------- Topups ---------------------------- */

export async function fetchTopups(): Promise<Topup[]> {
  if (DEMO_MODE) return demoListTopups();
  const { topups } = await request<{ topups: Topup[] }>('/api/topups');
  return topups;
}

export async function createTopup(amount: number, note: string): Promise<Topup> {
  if (DEMO_MODE) return demoCreateTopup(amount, note);
  const { topup } = await request<{ topup: Topup }>('/api/topups', {
    method: 'POST',
    body: JSON.stringify({ amount, note }),
  });
  return topup;
}

/* -------------------------- Password OTP ------------------------- */

export async function sendOtp(email: string): Promise<{ devCode?: string; message: string }> {
  if (DEMO_MODE) {
    const { devCode } = await demoSendOtp(email);
    return {
      devCode,
      message: devCode
        ? `Chế độ demo: mã OTP của bạn là ${devCode}`
        : 'Nếu email tồn tại, mã OTP đã được gửi.',
    };
  }
  const data = await request<{ message: string }>('/api/auth/otp', {
    method: 'POST',
    body: JSON.stringify({ action: 'send', email }),
  });
  return { message: data.message };
}

export async function resetPassword(email: string, code: string, password: string): Promise<string> {
  if (DEMO_MODE) {
    await demoResetPassword(email, code, password);
    return 'Đặt lại mật khẩu thành công, bạn có thể đăng nhập.';
  }
  const data = await request<{ message: string }>('/api/auth/otp', {
    method: 'POST',
    body: JSON.stringify({ action: 'reset', email, code, password }),
  });
  return data.message;
}

/* ------------------------------ Admin ---------------------------- */

export async function fetchAdminData(): Promise<AdminData> {
  if (DEMO_MODE) return demoAdminData();
  return request<AdminData>('/api/admin');
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  if (DEMO_MODE) {
    await demoSetOrderStatus(id, status);
    return;
  }
  await request('/api/admin', {
    method: 'POST',
    body: JSON.stringify({ action: 'order-status', id, status }),
  });
}

export async function approveTopup(id: string): Promise<void> {
  if (DEMO_MODE) {
    await demoApproveTopup(id);
    return;
  }
  await request('/api/admin', {
    method: 'POST',
    body: JSON.stringify({ action: 'topup-approve', id }),
  });
}

export async function rejectTopup(id: string): Promise<void> {
  if (DEMO_MODE) {
    await demoRejectTopup(id);
    return;
  }
  await request('/api/admin', {
    method: 'POST',
    body: JSON.stringify({ action: 'topup-reject', id }),
  });
}
