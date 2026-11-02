'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthProvider';
import { useToast } from './Toast';
import {
  IconArrow,
  IconCheck,
  IconClock,
  IconCopy,
  IconMail,
  IconShield,
  IconUser,
  IconWallet,
} from './Icons';
import { ORDER_STATUS, TOPUP_STATUS, formatDate, formatVnd } from '@/lib/catalog';
import {
  createTopup,
  fetchOrders,
  fetchTopups,
  getProfile,
  saveDisplayName,
} from '@/lib/api';
import type { Order, OrderStatus, Profile, Topup } from '@/lib/types';

type Tab = 'overview' | 'orders' | 'topup' | 'settings';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Tổng quan', icon: <IconUser width={16} height={16} /> },
  { id: 'orders', label: 'Đơn hàng', icon: <IconClock width={16} height={16} /> },
  { id: 'topup', label: 'Nạp tiền', icon: <IconWallet width={16} height={16} /> },
  { id: 'settings', label: 'Cài đặt', icon: <IconShield width={16} height={16} /> },
];

const PRESETS = [50000, 100000, 200000, 500000, 1000000];

const BANK = {
  name: process.env.NEXT_PUBLIC_BANK_NAME || 'MB Bank',
  account: process.env.NEXT_PUBLIC_BANK_ACCOUNT || '0123456789',
  owner: process.env.NEXT_PUBLIC_BANK_OWNER || 'NGUYEN VAN A',
};

function OrderBadge({ status }: { status: OrderStatus }) {
  const meta = ORDER_STATUS[status] || ORDER_STATUS.pending;
  return <span className={`badge badge--${meta.tone}`}>{meta.label}</span>;
}

function TopupBadge({ status }: { status: Topup['status'] }) {
  const meta = TOPUP_STATUS[status] || TOPUP_STATUS.pending;
  return <span className={`badge badge--${meta.tone}`}>{meta.label}</span>;
}

function useCopy() {
  const { notify } = useToast();
  return useCallback(
    async (value: string, label = 'Đã sao chép') => {
      try {
        await navigator.clipboard.writeText(value);
        notify(label, 'info');
      } catch {
        notify('Trình duyệt không cho phép sao chép tự động.', 'error');
      }
    },
    [notify],
  );
}

export function AccountDashboard() {
  const { user, loading: authLoading, logout, demo } = useAuth();
  const { notify } = useToast();
  const copy = useCopy();

  const [tab, setTab] = useState<Tab>('overview');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [topups, setTopups] = useState<Topup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');

  const [amount, setAmount] = useState(100000);
  const [customAmount, setCustomAmount] = useState('');
  const [topupNote, setTopupNote] = useState('');
  const [topupLoading, setTopupLoading] = useState(false);
  const [pendingTopup, setPendingTopup] = useState<Topup | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [savingName, setSavingName] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const [nextProfile, nextOrders, nextTopups] = await Promise.all([
        getProfile(),
        fetchOrders(),
        fetchTopups(),
      ]);
      setProfile(nextProfile);
      setOrders(nextOrders);
      setTopups(nextTopups);
      setDisplayName(nextProfile.displayName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    void load();
  }, [user, load]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get('tab');
    if (next && ['overview', 'orders', 'topup', 'settings'].includes(next)) setTab(next as Tab);
  }, []);

  const stats = useMemo(() => {
    const spent = orders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.price, 0);
    const completed = orders.filter((o) => o.status === 'completed').length;
    return { spent, completed, total: orders.length };
  }, [orders]);

  const filteredOrders = useMemo(
    () => (filter === 'all' ? orders : orders.filter((order) => order.status === filter)),
    [orders, filter],
  );

  const effectiveAmount = customAmount ? Number(customAmount.replace(/\D/g, '')) : amount;

  async function handleTopup(event: React.FormEvent) {
    event.preventDefault();
    setTopupLoading(true);
    try {
      const created = await createTopup(effectiveAmount, topupNote);
      setPendingTopup(created);
      setTopupNote('');
      notify('Đã tạo yêu cầu nạp tiền, vui lòng chuyển khoản theo hướng dẫn.');
      setTopups((prev) => [created, ...prev]);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Không tạo được yêu cầu nạp tiền.', 'error');
    } finally {
      setTopupLoading(false);
    }
  }

  async function handleSaveName(event: React.FormEvent) {
    event.preventDefault();
    setSavingName(true);
    try {
      const next = await saveDisplayName(displayName);
      setProfile(next);
      notify('Đã cập nhật tên hiển thị.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Không lưu được tên.', 'error');
    } finally {
      setSavingName(false);
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
        <div className="success-card__icon">
          <IconUser width={28} height={28} />
        </div>
        <h2 style={{ fontSize: '1.4rem' }}>Bạn chưa đăng nhập</h2>
        <p className="muted">Đăng nhập để xem số dư, lịch sử đơn hàng và lịch sử nạp tiền.</p>
        <div className="row" style={{ justifyContent: 'center', marginTop: 10 }}>
          <Link href="/dang-nhap" className="btn btn--primary">
            Đăng nhập <IconArrow width={16} height={16} />
          </Link>
          <Link href="/dang-ky" className="btn btn--ghost">
            Tạo tài khoản
          </Link>
        </div>
      </div>
    );
  }

  const initial = (profile?.displayName || user.email).charAt(0).toUpperCase();

  return (
    <div className="account-layout">
      <aside className="card account-side">
        <div className="account-user">
          <span className="avatar">{initial}</span>
          <div style={{ minWidth: 0 }}>
            <strong>{profile?.displayName || user.displayName}</strong>
            <span>{user.email}</span>
            {profile?.accountId && (
              <button
                type="button"
                className="account-id"
                onClick={() => void copy(profile.accountId, 'Đã sao chép mã tài khoản')}
                aria-label={`Sao chép mã tài khoản ${profile.accountId}`}
              >
                <span>Mã tài khoản</span>
                <b>{profile.accountId}</b>
                <IconCopy width={12} height={12} />
              </button>
            )}
          </div>
        </div>
        <nav className="account-nav" aria-label="Khu vực tài khoản">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`account-tab ${tab === item.id ? 'is-active' : ''}`}
              onClick={() => setTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="divider" />
        {profile?.isAdmin && (
          <Link href="/admin" className="account-tab" style={{ marginBottom: 4 }}>
            <IconShield width={16} height={16} />
            <span>Trang quản trị</span>
          </Link>
        )}
        <button type="button" className="account-tab" onClick={() => void logout()}>
          <IconArrow width={16} height={16} />
          <span>Đăng xuất</span>
        </button>
      </aside>

      <div className="account-main">
        {error && <div className="error-text">{error}</div>}
        {loading ? (
          <div className="card page-loader">
            <span className="spinner" /> Đang tải dữ liệu…
          </div>
        ) : (
          <>
            {tab === 'overview' && (
              <>
                <div className="balance-card">
                  <div>
                    <div className="balance-card__label">Số dư ví</div>
                    <div className="balance-card__value">{formatVnd(profile?.balance ?? 0)}</div>
                    <div className="balance-card__sub">
                      Dùng để thanh toán đơn ngay lập tức, không cần chờ duyệt.
                    </div>
                  </div>
                  <div className="row">
                    <button type="button" className="btn btn--primary" onClick={() => setTab('topup')}>
                      <IconWallet width={17} height={17} /> Nạp tiền
                    </button>
                    <Link href="/dat-don" className="btn btn--ghost">
                      Đặt đơn
                    </Link>
                  </div>
                </div>

                <div className="stat-cards">
                  <div className="card stat-card">
                    <span>Tổng đơn đã đặt</span>
                    <strong>{stats.total}</strong>
                  </div>
                  <div className="card stat-card">
                    <span>Đơn hoàn thành</span>
                    <strong>{stats.completed}</strong>
                  </div>
                  <div className="card stat-card">
                    <span>Tổng chi tiêu</span>
                    <strong>{formatVnd(stats.spent)}</strong>
                  </div>
                </div>

                <div className="card panel">
                  <div className="panel__head">
                    <div>
                      <h2>Đơn gần đây</h2>
                      <p>Trạng thái được cập nhật bởi đội ngũ xử lý.</p>
                    </div>
                    <button type="button" className="chip-btn" onClick={() => setTab('orders')}>
                      Xem tất cả
                    </button>
                  </div>
                  {orders.length === 0 ? (
                    <div className="empty">
                      <span className="empty__icon">
                        <IconClock width={22} height={22} />
                      </span>
                      <h3>Chưa có đơn nào</h3>
                      <p>Đơn đầu tiên của bạn sẽ xuất hiện ở đây ngay sau khi đặt.</p>
                      <Link href="/dat-don" className="btn btn--soft btn--sm">
                        Đặt đơn đầu tiên
                      </Link>
                    </div>
                  ) : (
                    <div className="table-wrap">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Mã đơn</th>
                            <th>Dịch vụ</th>
                            <th className="table__right">Giá</th>
                            <th>Trạng thái</th>
                            <th>Ngày</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.slice(0, 4).map((order) => (
                            <tr key={order.id}>
                              <td className="mono">{order.code}</td>
                              <td>
                                <span className="table__strong">{order.packageName}</span>
                                <span className="table__sub">{order.serviceName}</span>
                              </td>
                              <td className="table__right">{formatVnd(order.price)}</td>
                              <td>
                                <OrderBadge status={order.status} />
                              </td>
                              <td className="table__sub">{formatDate(order.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}

            {tab === 'orders' && (
              <div className="card panel">
                <div className="panel__head">
                  <div>
                    <h2>Lịch sử đặt hàng</h2>
                    <p>{orders.length} đơn · cập nhật theo thời gian thực</p>
                  </div>
                  <div className="tabs-inline">
                    {(['all', 'pending', 'processing', 'completed', 'cancelled'] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={`chip-btn ${filter === value ? 'is-active' : ''}`}
                        onClick={() => setFilter(value)}
                      >
                        {value === 'all' ? 'Tất cả' : ORDER_STATUS[value].label}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="empty">
                    <span className="empty__icon">
                      <IconClock width={22} height={22} />
                    </span>
                    <h3>Không có đơn phù hợp</h3>
                    <p>Thử bộ lọc khác hoặc đặt đơn mới.</p>
                    <Link href="/dat-don" className="btn btn--soft btn--sm">
                      Đặt đơn
                    </Link>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Mã đơn</th>
                          <th>Gói</th>
                          <th>UID game</th>
                          <th className="table__right">Giá</th>
                          <th>Trạng thái</th>
                          <th>Ngày đặt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order) => (
                          <tr key={order.id}>
                            <td>
                              <span className="mono table__strong">{order.code}</span>
                              <span className="table__sub">
                                {order.paymentMethod === 'balance' ? 'Ví nội bộ' : 'Chuyển khoản'}
                              </span>
                            </td>
                            <td>
                              <span className="table__strong">{order.packageName}</span>
                              <span className="table__sub">{order.serviceName}</span>
                            </td>
                            <td>
                              <span className="mono">{order.gameUid}</span>
                              <span className="table__sub">{order.gameServer}</span>
                            </td>
                            <td className="table__right">{formatVnd(order.price)}</td>
                            <td>
                              <OrderBadge status={order.status} />
                            </td>
                            <td className="table__sub">{formatDate(order.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {tab === 'topup' && (
              <>
                <div className="card panel">
                  <div className="panel__head">
                    <div>
                      <h2>Nạp tiền vào ví</h2>
                      <p>Số dư được cộng sau khi quản trị viên xác nhận chuyển khoản.</p>
                    </div>
                    <span className="badge badge--accent">Số dư: {formatVnd(profile?.balance ?? 0)}</span>
                  </div>

                  <div className="topup-grid">
                    <form onSubmit={handleTopup}>
                      <div className="topup-presets">
                        {PRESETS.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            className={`preset ${
                              !customAmount && amount === preset ? 'is-active' : ''
                            }`}
                            onClick={() => {
                              setAmount(preset);
                              setCustomAmount('');
                            }}
                          >
                            {formatVnd(preset)}
                          </button>
                        ))}
                      </div>

                      <div className="field">
                        <label className="label" htmlFor="custom-amount">
                          Hoặc nhập số tiền khác <em>Tối thiểu 20.000đ</em>
                        </label>
                        <input
                          id="custom-amount"
                          className="input"
                          inputMode="numeric"
                          placeholder="Ví dụ 150000"
                          value={customAmount}
                          onChange={(event) => setCustomAmount(event.target.value.replace(/\D/g, '').slice(0, 9))}
                        />
                      </div>

                      <div className="field">
                        <label className="label" htmlFor="topup-note">
                          Ghi chú <em>Tuỳ chọn</em>
                        </label>
                        <input
                          id="topup-note"
                          className="input"
                          placeholder="Vui lòng nhập ở đây."
                          value={topupNote}
                          onChange={(event) => setTopupNote(event.target.value)}
                          maxLength={300}
                        />
                      </div>

                      <button type="submit" className="btn btn--primary btn--block" disabled={topupLoading}>
                        {topupLoading ? <span className="spinner" /> : `Tạo lệnh nạp ${formatVnd(effectiveAmount || 0)}`}
                      </button>
                      <p className="hint mt-1">
                        Vui lòng nhập mã tài khoản vào nội dung chuyển khoản!!!
                      </p>
                    </form>

                    <div className="bank-box">
                      <h4>Thông tin chuyển khoản</h4>
                      <div className="bank-row">
                        <span>Ngân hàng</span>
                        <b>{BANK.name}</b>
                      </div>
                      <div className="bank-row">
                        <span>Số tài khoản</span>
                        <b>{BANK.account}</b>
                        <button type="button" className="copy-btn" onClick={() => void copy(BANK.account)}>
                          <IconCopy width={13} height={13} /> Sao chép
                        </button>
                      </div>
                      <div className="bank-row">
                        <span>Chủ tài khoản</span>
                        <b>{BANK.owner}</b>
                      </div>
                      <div className="bank-row">
                        <span>Nội dung</span>
                        <b>{pendingTopup ? pendingTopup.code : 'Mã giao dịch sau khi tạo lệnh'}</b>
                      </div>
                      <div className="bank-qr">
                        <img
                          src="/momo-vietqr.png"
                          alt="Mã QR nhận chuyển khoản"
                          className="bank-qr__image"
                        />
                        <p>
                          Quét mã rồi nhập đúng số tiền và mã giao dịch sau khi tạo lệnh. Giao dịch vẫn
                          cần quản trị viên xác nhận.
                        </p>
                      </div>
                      {pendingTopup ? (
                        <div className="summary__note" style={{ marginTop: 6 }}>
                          Chuyển <strong>{formatVnd(pendingTopup.amount)}</strong> với nội dung{' '}
                          <strong className="mono">{pendingTopup.code}</strong>. Sau khi chuyển, quản trị
                          viên sẽ duyệt trong 5 – 15 phút (giờ hành chính).
                        </div>
                      ) : (
                        <p className="hint" style={{ margin: 0 }}>
                          Hiện tại chưa thể nạp thẳng vào website sau khi chuyển khoản, vui lòng liên hệ admin để duyệt bill chuyển khoản.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="card panel">
                  <div className="panel__head">
                    <div>
                      <h2>Lịch sử nạp tiền</h2>
                      <p>{topups.length} giao dịch</p>
                    </div>
                  </div>
                  {topups.length === 0 ? (
                    <div className="empty">
                      <span className="empty__icon">
                        <IconWallet width={22} height={22} />
                      </span>
                      <h3>Chưa có giao dịch</h3>
                      <p>Lịch sử nạp tiền sẽ xuất hiện sau khi bạn tạo lệnh đầu tiên.</p>
                    </div>
                  ) : (
                    <div className="table-wrap">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Mã giao dịch</th>
                            <th>Phương thức</th>
                            <th className="table__right">Số tiền</th>
                            <th>Trạng thái</th>
                            <th>Thời gian</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topups.map((topup) => (
                            <tr key={topup.id}>
                              <td className="mono">{topup.code}</td>
                              <td className="table__sub">{topup.method}</td>
                              <td className="table__right">{formatVnd(topup.amount)}</td>
                              <td>
                                <TopupBadge status={topup.status} />
                              </td>
                              <td className="table__sub">{formatDate(topup.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}

            {tab === 'settings' && (
              <>
                <div className="card panel">
                  <div className="panel__head">
                    <div>
                      <h2>Thông tin tài khoản</h2>
                      <p>Email dùng để nhận xác nhận đơn và mã OTP.</p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveName}>
                    <div className="field">
                      <label className="label" htmlFor="display-name">
                        Tên hiển thị
                      </label>
                      <input
                        id="display-name"
                        className="input"
                        value={displayName}
                        onChange={(event) => setDisplayName(event.target.value)}
                        maxLength={40}
                      />
                    </div>
                    <div className="field">
                      <label className="label" htmlFor="account-email">
                        Email
                      </label>
                      <input id="account-email" className="input" value={user.email} disabled />
                      <span className="hint">
                        <IconMail width={13} height={13} style={{ display: 'inline', verticalAlign: '-2px' }} />{' '}
                        Thay đổi email cần xác thực lại — hãy liên hệ hỗ trợ.
                      </span>
                    </div>
                    <button type="submit" className="btn btn--primary" disabled={savingName}>
                      {savingName ? <span className="spinner" /> : 'Lưu thay đổi'}
                    </button>
                  </form>
                </div>

                <div className="card panel">
                  <div className="panel__head">
                    <div>
                      <h2>Bảo mật & phiên đăng nhập</h2>
                      <p>Đổi mật khẩu bằng mã OTP gửi tới email của bạn.</p>
                    </div>
                  </div>
                  <div className="row">
                    <Link href="/quen-mat-khau" className="btn btn--ghost">
                      Đổi mật khẩu qua OTP
                    </Link>
                    <button type="button" className="btn btn--danger-soft" onClick={() => void logout()}>
                      Đăng xuất khỏi thiết bị này
                    </button>
                  </div>
                  {demo && (
                    <>
                      <div className="divider" />
                      <p className="hint">
                        Chế độ demo lưu dữ liệu trong trình duyệt. Xoá dữ liệu demo sẽ đặt lại toàn bộ đơn
                        hàng, số dư và tài khoản mẫu.
                      </p>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => {
                          window.localStorage.removeItem('vongnguyet.demo.v1');
                          window.localStorage.removeItem('vongnguyet.demo.session');
                          window.location.href = '/';
                        }}
                      >
                        Xoá dữ liệu demo
                      </button>
                    </>
                  )}
                </div>
              </>
            )}

            {tab === 'overview' && profile?.isAdmin && (
              <div className="card panel">
                <div className="spread">
                  <div>
                    <h2 style={{ fontSize: '1.05rem', marginBottom: 4 }}>Bạn là quản trị viên</h2>
                    <p className="muted" style={{ fontSize: '0.83rem', margin: 0 }}>
                      Duyệt nạp tiền và cập nhật trạng thái đơn trong trang quản trị.
                    </p>
                  </div>
                  <Link href="/admin" className="btn btn--soft btn--sm">
                    Mở quản trị <IconArrow width={14} height={14} />
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
