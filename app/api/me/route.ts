import { NextResponse, type NextRequest } from 'next/server';
import { ensureProfile, updateDisplayName } from '@/lib/server/store';
import { jsonError, requireAcceptedPolicies, requireUser } from '@/lib/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    await requireAcceptedPolicies(user);
    const profile = await ensureProfile(user);
    return NextResponse.json({ profile });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser(request);
    await requireAcceptedPolicies(user);
    const body = await request.json().catch(() => ({}));
    await updateDisplayName(user.uid, String(body.displayName || ''));
    const profile = await ensureProfile(user);
    return NextResponse.json({ profile });
  } catch (error) {
    return jsonError(error);
  }
}
