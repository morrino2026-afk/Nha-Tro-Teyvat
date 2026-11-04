import { NextResponse, type NextRequest } from 'next/server';
import { AppError, jsonError, requireAcceptedPolicies, requireUser } from '@/lib/server/http';
import { adminConfigured } from '@/lib/server/firebase';
import { reserveTopupCode } from '@/lib/server/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    if (!adminConfigured()) throw new AppError(503, 'Server chưa cấu hình Firebase.');
    const user = await requireUser(request);
    await requireAcceptedPolicies(user);
    const body = await request.json().catch(() => ({}));
    const reservation = await reserveTopupCode(user, Number(body.amount || 0));
    return NextResponse.json({ reservation });
  } catch (error) {
    return jsonError(error);
  }
}
