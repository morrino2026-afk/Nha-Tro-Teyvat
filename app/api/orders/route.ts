import { after, NextResponse, type NextRequest } from 'next/server';
import { resolveOrderItems } from '@/lib/catalog';
import { AppError, jsonError, requireUser } from '@/lib/server/http';
import { sendOrderEmails } from '@/lib/server/mail';
import { createOrder, listOrders } from '@/lib/server/store';
import { adminConfigured } from '@/lib/server/firebase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!adminConfigured()) throw new AppError(503, 'Server chưa cấu hình Firebase.');
    const user = await requireUser(request);
    const orders = await listOrders(user.uid);
    return NextResponse.json({ orders });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!adminConfigured()) throw new AppError(503, 'Server chưa cấu hình Firebase.');
    const user = await requireUser(request);
    const body = await request.json().catch(() => ({}));

    const resolved = resolveOrderItems(body);
    if (resolved.error) throw new AppError(400, resolved.error);
    const items = resolved.items;

    const paymentMethod = body.paymentMethod === 'transfer' ? 'transfer' : 'balance';
    const gameUid = String(body.gameUid || '').trim();
    if (!/^\d{6,12}$/.test(gameUid)) {
      throw new AppError(400, 'UID Genshin phải là dãy 6 – 12 chữ số.');
    }

    const order = await createOrder(user, {
      items,
      gameUid,
      gameServer: String(body.gameServer || 'Asia'),
      gameName: String(body.gameName || '').slice(0, 40),
      note: String(body.note || ''),
      paymentMethod,
    });

    after(async () => {
      await sendOrderEmails(order);
    });
    return NextResponse.json({ order });
  } catch (error) {
    return jsonError(error);
  }
}
