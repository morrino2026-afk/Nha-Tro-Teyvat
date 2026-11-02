import { NextResponse, type NextRequest } from 'next/server';
import { AppError, jsonError, requireUser } from '@/lib/server/http';
import { sendTopupEmails } from '@/lib/server/mail';
import { createTopup, listTopups } from '@/lib/server/store';
import { adminConfigured } from '@/lib/server/firebase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!adminConfigured()) throw new AppError(503, 'Server chưa cấu hình Firebase.');
    const user = await requireUser(request);
    const topups = await listTopups(user.uid);
    return NextResponse.json({ topups });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!adminConfigured()) throw new AppError(503, 'Server chưa cấu hình Firebase.');
    const user = await requireUser(request);
    const body = await request.json().catch(() => ({}));
    const amount = Number(body.amount || 0);
    const topup = await createTopup(user, amount, String(body.note || ''));

    void sendTopupEmails(topup, false);
    return NextResponse.json({ topup });
  } catch (error) {
    return jsonError(error);
  }
}
