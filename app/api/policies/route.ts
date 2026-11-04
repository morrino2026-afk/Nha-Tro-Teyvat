import { NextResponse, type NextRequest } from 'next/server';
import { jsonError, requireUser } from '@/lib/server/http';
import { hasAcceptedPolicies, recordPolicyAcceptance } from '@/lib/server/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const accepted = await hasAcceptedPolicies(user.uid);
    return NextResponse.json({ accepted });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    await recordPolicyAcceptance(user.uid);
    return NextResponse.json({ accepted: true });
  } catch (error) {
    return jsonError(error);
  }
}
