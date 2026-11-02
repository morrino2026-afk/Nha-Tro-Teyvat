import { NextResponse, type NextRequest } from 'next/server';
import { AppError, jsonError } from '@/lib/server/http';
import { requestPasswordOtp, resetPasswordWithOtp } from '@/lib/server/otp';
import { adminConfigured } from '@/lib/server/firebase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    if (!adminConfigured()) {
      throw new AppError(503, 'Máy chủ chưa được cấu hình Firebase. Xem hướng dẫn trong README.');
    }
    const body = await request.json().catch(() => ({}));
    const action = String(body.action || '');

    if (action === 'send') {
      await requestPasswordOtp(String(body.email || ''));
      return NextResponse.json({
        ok: true,
        message: 'Nếu email tồn tại trong hệ thống, mã OTP đã được gửi đi.',
      });
    }

    if (action === 'reset') {
      await resetPasswordWithOtp(
        String(body.email || ''),
        String(body.code || ''),
        String(body.password || ''),
      );
      return NextResponse.json({ ok: true, message: 'Đặt lại mật khẩu thành công, bạn có thể đăng nhập.' });
    }

    throw new AppError(400, 'Hành động không hợp lệ.');
  } catch (error) {
    return jsonError(error);
  }
}
