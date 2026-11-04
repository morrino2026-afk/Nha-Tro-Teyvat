import { NextResponse, type NextRequest } from 'next/server';
import { adminAuth, adminConfigured, adminDb } from './firebase';
import { PRIVACY_VERSION, TERMS_VERSION } from '../policies';

export class AppError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function jsonError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error('[api]', error);
  const message =
    error instanceof Error && process.env.NODE_ENV !== 'production'
      ? error.message
      : 'Có lỗi xảy ra, vui lòng thử lại sau.';
  return NextResponse.json({ error: message }, { status: 500 });
}

export interface AuthUser {
  uid: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function checkIsAdmin(email?: string | null): boolean {
  if (!email) return false;
  const list = adminEmails();
  return list.includes(email.toLowerCase());
}

export async function requireUser(request: NextRequest): Promise<AuthUser> {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!adminConfigured()) {
    throw new AppError(503, 'Máy chủ chưa được cấu hình Firebase. Xem hướng dẫn trong README.');
  }
  if (!token) throw new AppError(401, 'Bạn cần đăng nhập để tiếp tục.');

  try {
    const decoded = await adminAuth().verifyIdToken(token);
    const email = decoded.email || '';
    return {
      uid: decoded.uid,
      email,
      name: decoded.name || email.split('@')[0] || 'Người chơi',
      isAdmin: checkIsAdmin(email),
    };
  } catch {
    throw new AppError(401, 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
  }
}

export async function requireAcceptedPolicies(user: AuthUser): Promise<void> {
  const snapshot = await adminDb().collection('users').doc(user.uid).get();
  const acceptance = snapshot.data()?.policyAcceptance;
  if (
    acceptance?.termsVersion !== TERMS_VERSION ||
    acceptance?.privacyVersion !== PRIVACY_VERSION
  ) {
    throw new AppError(403, 'Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật để tiếp tục.');
  }
}

export function requireAdmin(user: AuthUser) {
  if (!user.isAdmin) throw new AppError(403, 'Bạn không có quyền truy cập trang quản trị.');
}
