import { NextResponse, type NextRequest } from 'next/server';
import { AppError, jsonError, requireAdmin, requireUser } from '@/lib/server/http';
import { sendTopupEmails } from '@/lib/server/mail';
import {
  approveTopup,
  getTopup,
  listAllOrders,
  listAllTopups,
  rejectTopup,
  setOrderStatus,
} from '@/lib/server/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    requireAdmin(user);
    const [orders, topups] = await Promise.all([listAllOrders(), listAllTopups()]);
    const stats = {
      revenue: orders
        .filter((order) => order.status !== 'cancelled')
        .reduce((sum, order) => sum + order.price, 0),
      activeOrders: orders.filter((order) => ['pending', 'processing'].includes(order.status)).length,
      pendingTopups: topups.filter((topup) => topup.status === 'pending').length,
      totalOrders: orders.length,
    };
    return NextResponse.json({ orders, topups, stats });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    requireAdmin(user);
    const body = await request.json().catch(() => ({}));
    const action = String(body.action || '');
    const id = String(body.id || '');
    if (!id) throw new AppError(400, 'Thiếu mã bản ghi.');

    if (action === 'order-status') {
      await setOrderStatus(id, body.status);
      return NextResponse.json({ ok: true });
    }

    if (action === 'topup-approve') {
      const topup = await getTopup(id);
      await approveTopup(id);
      if (topup) {
        void sendTopupEmails({ ...topup, status: 'approved' }, true);
      }
      return NextResponse.json({ ok: true });
    }

    if (action === 'topup-reject') {
      await rejectTopup(id);
      return NextResponse.json({ ok: true });
    }

    throw new AppError(400, 'Hành động không hợp lệ.');
  } catch (error) {
    return jsonError(error);
  }
}
