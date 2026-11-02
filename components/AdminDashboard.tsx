'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import { useToast } from './Toast';
import { IconArrow, IconShield } from './Icons';
import { ORDER_STATUS, TOPUP_STATUS, formatDate, formatVnd } from '@/lib/catalog';
import { approveTopup, fetchAdminData, rejectTopup, updateOrderStatus, type AdminData } from '@/lib/api';
import type { Order, OrderStatus, Topup } from '@/lib/types';

const ORDER_STATUSES: OrderStatus[] = ['awaiting_payment', 'pending', 'processing', 'completed', 'cancelled'];

export function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { notify } = useToast();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [view, setView] = useState<'orders' | 'topups'>('orders');

  const load = useCallback(async () => {
    setError('');
    try {
      setData(await fetchAdminData());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu quản trị.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    void load();
  }, [user, load]);

  async function changeStatus(order: Order, status: OrderStatus) {
    setBusy(order.id);
    try {
      await updateOrderStatus(order.id, status);
      setData((prev) =>
        prev ? { ...prev, orders: prev.orders.map((item) => (item.id === order.id ? { ...item, status } : item)) } : prev,
      );
      notify(`Đã chuyển ${order.code} sang “${ORDER_STATUS[status].label}”.`);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Không cập nhật được.', 'error');
    } finally {
      setBusy(null);
    }
  }

  async function handleTopup(topup: Topup, action: 'approve' | 'reject') {
    setBusy(topup.id);
    try {
      if (action === 'approve') await approveTopup(topup.id);
      else await rejectTopup(topup.id);
      const status = action === 'approve' ? 'approved' : 'rejected';
      setData((prev) =>
        prev
          ? {
              ...prev,
              topups: prev.topups.map((item) => (item.id === topup.id ? { ...item, status } : item)),
            }
          : prev,
      );
      notify(action === 'approve' ? `Đã cộng ${formatVnd(topup.amount)} cho ${topup.email}.` : 'Đã từ chối giao dịch.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Không xử lý được giao dịch.', 'error');
    } finally {
      setBusy(null);
    }
  }

  if (authLoading) {
    return (
      <div className="page-loader">
        <span className="spinner" /> Đang tải…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 'clamp(30px, 6vw, 56px)' }}>
        <h2 style={{ fontSize: '1.4rem' }}>Cần đăng nhập</h2>
        <p className="muted">Trang này chỉ dành cho quản trị viên.</p>
        <Link href="/dang-nhap" className="btn btn--primary">
          Đăng nhập <IconArrow width={16} height={16} />
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-loader">
        <span className="spinner" /> Đang tải bảng điều khiển…
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 'clamp(30px, 6vw, 56px)' }}>
        <div className="success-card__icon">
          <IconShield width={26} height={26} />
        </div>
        <h2 style={{ fontSize: '1.3rem' }}>Không có quyền truy cập</h2>
        <p className="muted" style={{ maxWidth: 480, marginInline: 'auto' }}>{error}</p>
        <p className="hint">
          Thêm email <strong>{user.email}</strong> vào biến môi trường ADMIN_EMAILS (cách nhau bằng dấu phẩy)
          rồi tải lại trang.
        </p>
        <Link href="/tai-khoan" className="btn btn--ghost mt-2">
          Về trang tài khoản
        </Link>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="admin-grid">
      <div className="stat-cards">
        <div className="card stat-card">
          <span>Doanh thu ghi nhận</span>
          <strong>{formatVnd(data.stats.revenue)}</strong>
        </div>
        <div className="card stat-card">
          <span>Đơn đang xử lý</span>
          <strong>{data.stats.activeOrders}</strong>
        </div>
        <div className="card stat-card">
          <span>Nạp tiền chờ duyệt</span>
          <strong>{data.stats.pendingTopups}</strong>
        </div>
      </div>

      <div className="card panel">
        <div className="panel__head">
          <div className="tabs-inline">
            <button
              type="button"
              className={`chip-btn ${view === 'orders' ? 'is-active' : ''}`}
              onClick={() => setView('orders')}
            >
              Đơn hàng ({data.orders.length})
            </button>
            <button
              type="button"
              className={`chip-btn ${view === 'topups' ? 'is-active' : ''}`}
              onClick={() => setView('topups')}
            >
              Nạp tiền ({data.topups.length})
            </button>
          </div>
          <button type="button" className="mini-btn" onClick={() => void load()}>
            Tải lại
          </button>
        </div>

        {view === 'orders' &&
          (data.orders.length === 0 ? (
            <div className="empty">
              <h3>Chưa có đơn hàng</h3>
              <p>Đơn mới sẽ xuất hiện ở đây ngay khi khách đặt.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Khách</th>
                    <th>Gói</th>
                    <th>UID</th>
                    <th className="table__right">Giá</th>
                    <th>Trạng thái</th>
                    <th>Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {data.orders.map((order) => (
                    <tr key={order.id}>
                      <td className="mono">{order.code}</td>
                      <td>
                        <span className="table__strong">{order.email}</span>
                        <span className="table__sub">{order.paymentMethod === 'balance' ? 'Ví' : 'Chuyển khoản'}</span>
                      </td>
                      <td>
                        <span className="table__strong">{order.packageName}</span>
                        <span className="table__sub">{order.serviceName}</span>
                        {order.note && <span className="table__sub">“{order.note}”</span>}
                      </td>
                      <td>
                        <span className="mono">{order.gameUid}</span>
                        <span className="table__sub">{order.gameServer}</span>
                      </td>
                      <td className="table__right">{formatVnd(order.price)}</td>
                      <td>
                        <select
                          className="status-select"
                          value={order.status}
                          disabled={busy === order.id}
                          onChange={(event) => void changeStatus(order, event.target.value as OrderStatus)}
                          aria-label={`Trạng thái đơn ${order.code}`}
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {ORDER_STATUS[status].label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="table__sub">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

        {view === 'topups' &&
          (data.topups.length === 0 ? (
            <div className="empty">
              <h3>Chưa có giao dịch</h3>
              <p>Yêu cầu nạp tiền của khách sẽ hiển thị tại đây.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Khách</th>
                    <th className="table__right">Số tiền</th>
                    <th>Ghi chú</th>
                    <th>Trạng thái</th>
                    <th>Thời gian</th>
                    <th className="table__right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topups.map((topup) => (
                    <tr key={topup.id}>
                      <td className="mono">{topup.code}</td>
                      <td>{topup.email}</td>
                      <td className="table__right">{formatVnd(topup.amount)}</td>
                      <td className="table__sub">{topup.note || '—'}</td>
                      <td>
                        <span className={`badge badge--${TOPUP_STATUS[topup.status].tone}`}>
                          {TOPUP_STATUS[topup.status].label}
                        </span>
                      </td>
                      <td className="table__sub">{formatDate(topup.createdAt)}</td>
                      <td className="table__right">
                        {topup.status === 'pending' ? (
                          <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="mini-btn mini-btn--ok"
                              disabled={busy === topup.id}
                              onClick={() => void handleTopup(topup, 'approve')}
                            >
                              Duyệt
                            </button>
                            <button
                              type="button"
                              className="mini-btn mini-btn--no"
                              disabled={busy === topup.id}
                              onClick={() => void handleTopup(topup, 'reject')}
                            >
                              Từ chối
                            </button>
                          </div>
                        ) : (
                          <span className="table__sub">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </div>

      <div className="card panel">
        <div className="panel__head">
          <div>
            <h2>Ghi chú vận hành</h2>
            <p>Những việc nên làm mỗi ngày để khách không phải chờ.</p>
          </div>
        </div>
        <ul className="service-card__list" style={{ margin: 0 }}>
          <li>Kiểm tra sao kê ngân hàng trước khi duyệt lệnh nạp tiền.</li>
          <li>Đổi trạng thái đơn sang “Đang cày” ngay khi thợ nhận để khách yên tâm.</li>
          <li>Gửi ảnh chụp kết quả qua email sau khi đơn hoàn thành.</li>
          <li>Đơn chuyển khoản chưa thanh toán sau 24 giờ nên chuyển sang “Đã huỷ”.</li>
        </ul>
      </div>
    </div>
  );
}
