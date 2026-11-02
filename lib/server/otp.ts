import { createHash, randomInt, timingSafeEqual } from 'node:crypto';
import { Timestamp } from 'firebase-admin/firestore';
import { adminAuth, adminDb } from './firebase';
import { AppError } from './http';
import { mailConfigured, sendOtpEmail } from './mail';

const OTPS = 'otps';
const TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function hash(code: string, uid: string): string {
  const secret = process.env.OTP_SECRET || 'vong-nguyet-otp-secret';
  return createHash('sha256').update(`${code}:${uid}:${secret}`).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

async function findUser(email: string) {
  try {
    return await adminAuth().getUserByEmail(email.trim().toLowerCase());
  } catch {
    return null;
  }
}

/**
 * Gửi OTP. Luôn trả về thành công như nhau để tránh dò email tồn tại.
 */
export async function requestPasswordOtp(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new AppError(400, 'Email không hợp lệ.');
  }

  const user = await findUser(normalized);
  if (!user) return;

  const ref = adminDb().collection(OTPS).doc(user.uid);
  const existing = await ref.get();
  const sentAt = existing.data()?.sentAt;
  if (sentAt instanceof Timestamp && Date.now() - sentAt.toMillis() < 60_000) {
    throw new AppError(429, 'Bạn vừa yêu cầu mã, vui lòng đợi 60 giây rồi thử lại.');
  }

  const code = String(randomInt(100000, 1000000));
  await ref.set({
    email: normalized,
    codeHash: hash(code, user.uid),
    attempts: 0,
    sentAt: Timestamp.now(),
    expiresAt: Timestamp.fromMillis(Date.now() + TTL_MS),
  });

  const delivered = await sendOtpEmail(normalized, code);
  if (!delivered && mailConfigured()) {
    throw new AppError(500, 'Không gửi được email OTP, vui lòng thử lại sau ít phút.');
  }
  if (!delivered) {
    console.warn(`[otp] Chưa cấu hình Gmail, mã OTP cho ${normalized} là: ${code}`);
  }
}

export async function resetPasswordWithOtp(
  email: string,
  code: string,
  password: string,
): Promise<void> {
  if (!code || !/^\d{6}$/.test(code.trim())) throw new AppError(400, 'Mã OTP phải gồm 6 chữ số.');
  if (!password || password.length < 6) throw new AppError(400, 'Mật khẩu phải có ít nhất 6 ký tự.');

  const user = await findUser(email);
  if (!user) throw new AppError(400, 'Mã OTP không đúng hoặc đã hết hạn.');

  const ref = adminDb().collection(OTPS).doc(user.uid);
  const snapshot = await ref.get();
  const data = snapshot.data();
  if (!data) throw new AppError(400, 'Mã OTP không đúng hoặc đã hết hạn.');

  const expiresAt = data.expiresAt;
  if (!(expiresAt instanceof Timestamp) || expiresAt.toMillis() < Date.now()) {
    await ref.delete();
    throw new AppError(400, 'Mã OTP đã hết hạn, vui lòng yêu cầu mã mới.');
  }

  if (Number(data.attempts || 0) >= MAX_ATTEMPTS) {
    await ref.delete();
    throw new AppError(429, 'Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã mới.');
  }

  if (!safeEqual(String(data.codeHash), hash(code.trim(), user.uid))) {
    await ref.update({ attempts: Number(data.attempts || 0) + 1 });
    throw new AppError(400, 'Mã OTP không đúng.');
  }

  await adminAuth().updateUser(user.uid, { password });
  await ref.delete();
}
