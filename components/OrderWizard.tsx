'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthProvider';
import { useToast } from './Toast';
import {
  IconAbyss,
  IconArrow,
  IconCheck,
  IconClock,
  IconTheater,
  IconVision,
  IconWallet,
} from './Icons';
import { GAME_SERVERS, SERVICES, findPackage, formatVnd } from '@/lib/catalog';
import { getProfile, placeOrder } from '@/lib/api';
import type { Order, PaymentMethod, Profile } from '@/lib/types';

const STEPS = ['Chọn gói', 'Thông tin', 'Thanh toán'];

function ServiceIcon({ icon }: { icon: 'abyss' | 'theater' | 'vision' }) {
  if (icon === 'abyss') return <IconAbyss width={20} height={20} />;
  if (icon === 'theater') return <IconTheater width={20} height={20} />;
  return <IconVision width={20} height={20} />;
}

export function OrderWizard() {
  const { user, loading: authLoading } = useAuth();
  const { notify } = useToast();

  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState(SERVICES[0].id);
  const [picked, setPicked] = useState<string[]>([`${SERVICES[0].id}::${SERVICES[0].packages[1].id}`]);
  const [gameUid, setGameUid] = useState('');
  const [gameServer, setGameServer] = useState(GAME_SERVERS[0]);
  const [gameName, setGameName] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('balance');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) return;
    getProfile()
      .then(setProfile)
      .catch(() => undefined);
  }, [user]);

  const service = useMemo(() => SERVICES.find((item) => item.id === serviceId)!, [serviceId]);

  /** Các gói đã chọn — một đơn có thể gộp nhiều dịch vụ (combo La Hoàn + Ảo Cảnh + Nhà Hát). */
  const pickedItems = useMemo(
    () =>
      picked
        .map((key) => {
          const [sid, pid] = key.split('::');
          const found = findPackage(sid, pid);
          return found.service && found.pkg ? { service: found.service, pkg: found.pkg } : null;
        })
        .filter((entry) => entry !== null),
    [picked],
  );

  const pickedCount = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const entry of pickedItems) counts[entry.service.id] = (counts[entry.service.id] || 0) + 1;
    return counts;
  }, [pickedItems]);

  const total = pickedItems.reduce((sum, entry) => sum + entry.pkg.price, 0);

  const perks = useMemo(
    () => Array.from(new Set(pickedItems.flatMap((entry) => entry.pkg.perks))).slice(0, 6),
    [pickedItems],
  );

  function chooseService(id: typeof serviceId) {
    setServiceId(id);
  }

  function togglePackage(serviceKey: string, pkgKey: string) {
    const key = `${serviceKey}::${pkgKey}`;
    setPicked((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  }

  const balance = profile?.balance ?? 0;
  const insufficient = paymentMethod === 'balance' && balance < total;

  function goNext() {
    setError('');
    if (step === 0) {
      if (!pickedItems.length) {
        setError('Chọn ít nhất một gói dịch vụ để tiếp tục.');
        return;
      }
      setStep(1);
      return;
    }
    if (step === 1) {
      if (!/^\d{6,12}$/.test(gameUid.trim())) {
        setError('UID Genshin phải là dãy 6 – 12 chữ số (ví dụ 801234567).');
        return;
      }
      setStep(2);
    }
  }

  async function submit() {
    if (!user) return;
    setError('');
    setSubmitting(true);
    try {
      const created = await placeOrder({
        items: pickedItems.map((entry) => ({
          serviceId: entry.service.id,
          serviceName: entry.service.name,
          packageId: entry.pkg.id,
          packageName: entry.pkg.name,
          price: entry.pkg.price,
        })),
        gameUid: gameUid.trim(),
        gameServer,
        gameName,
        note,
        paymentMethod,
      });
      setOrder(created);
      notify('Đặt đơn thành công! Kiểm tra email để xem xác nhận.');
      getProfile().then(setProfile).catch(() => undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo đơn, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="page-loader">
        <span className="spinner" /> Đang kiểm tra đăng nhập…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 'clamp(30px, 6vw, 56px)' }}>
        <div className="success-card__icon">
          <IconWallet width={28} height={28} />
        </div>
        <h2 style={{ fontSize: '1.4rem' }}>Đăng nhập để đặt đơn</h2>
        <p className="muted" style={{ maxWidth: 460, marginInline: 'auto' }}>
          Đơn hàng, số dư ví và lịch sử giao dịch được gắn với tài khoản của bạn. Chỉ mất 30 giây để đăng
          nhập bằng email hoặc Google.
        </p>
        <div className="row" style={{ justifyContent: 'center', marginTop: 8 }}>
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

  if (order) {
    return (
      <div className="card success-card">
        <div className="success-card__icon">
          <IconCheck width={32} height={32} />
        </div>
        <h2 style={{ fontSize: '1.5rem' }}>Đơn đã được ghi nhận</h2>
        <p className="muted">
          {order.paymentMethod === 'balance'
            ? 'Số dư ví đã được trừ. Đội ngũ sẽ nhận đơn trong ít phút và bắt đầu leo tháp.'
            : 'Đơn đang chờ thanh toán. Sau khi chuyển khoản, quản trị viên sẽ xác nhận và bắt đầu xử lý.'}
        </p>
        <div className="code-chip">{order.code}</div>
        <p className="muted" style={{ fontSize: '0.85rem' }}>
          Xác nhận đã được gửi tới <strong>{order.email}</strong>. Bạn có thể theo dõi trạng thái trong
          trang tài khoản.
        </p>
        <div className="success-card__actions">
          <Link href="/tai-khoan?tab=orders" className="btn btn--primary">
            Xem lịch sử đơn
          </Link>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              setOrder(null);
              setStep(0);
              setNote('');
              setPicked([`${SERVICES[0].id}::${SERVICES[0].packages[1].id}`]);
            }}
          >
            Đặt đơn khác
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-layout">
      <div className="card wizard">
        <div className="wizard-steps">
          {STEPS.map((label, index) => (
            <div key={label} className="row" style={{ gap: 8 }}>
              <div
                className={`wizard-step ${index === step ? 'is-active' : ''} ${
                  index < step ? 'is-done' : ''
                }`}
              >
                <span className="wizard-step__dot">
                  {index < step ? <IconCheck width={13} height={13} /> : index + 1}
                </span>
                {label}
              </div>
              {index < STEPS.length - 1 && <span className="wizard-step__line" />}
            </div>
          ))}
        </div>

        {error && <div className="error-text">{error}</div>}

        {step === 0 && (
          <>
            <h2>Bạn muốn chinh phục nội dung nào?</h2>
            <p className="wizard__sub">
              Chọn một hoặc nhiều gói — gộp La Hoàn + Ảo Cảnh + Nhà Hát thành một đơn thanh toán duy nhất.
            </p>

            <div className="choice-grid" style={{ marginBottom: 18 }}>
              {SERVICES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`choice ${serviceId === item.id ? 'is-selected' : ''}`}
                  onClick={() => chooseService(item.id)}
                >
                  <span className="choice__icon">
                    <ServiceIcon icon={item.icon} />
                  </span>
                  <span className="choice__body">
                    <strong>
                      {item.name}{' '}
                      {pickedCount[item.id] ? <span className="tag">{pickedCount[item.id]} gói</span> : null}
                    </strong>
                    <span>{item.tagline}</span>
                  </span>
                  <span className="choice__radio" aria-hidden />
                </button>
              ))}
            </div>

            <div className="pkg-list">
              {service.packages.map((pkg) => {
                const key = `${service.id}::${pkg.id}`;
                const isPicked = picked.includes(key);
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    className={`pkg ${isPicked ? 'is-selected' : ''}`}
                    onClick={() => togglePackage(service.id, pkg.id)}
                    aria-pressed={isPicked}
                  >
                    <span>
                      <strong>
                        {pkg.name} {pkg.popular && <span className="tag">Phổ biến</span>}
                      </strong>
                      <span>
                        {pkg.duration} · {pkg.desc}
                      </span>
                    </span>
                    <span className="pkg__price">
                      {isPicked && (
                        <span className="pkg__check" aria-hidden>
                          <IconCheck width={12} height={12} />
                        </span>
                      )}
                      {formatVnd(pkg.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2>Thông tin tài khoản game</h2>
            <p className="wizard__sub">
              Chúng tôi chỉ dùng thông tin này để xác định đúng nhân vật. Không bao giờ đổi mật khẩu.
            </p>

            <div className="field">
              <label className="label" htmlFor="gameUid">
                UID Genshin <em>Bắt buộc</em>
              </label>
              <input
                id="gameUid"
                className="input mono"
                inputMode="numeric"
                placeholder="801234567"
                value={gameUid}
                onChange={(event) => setGameUid(event.target.value.replace(/\D/g, '').slice(0, 12))}
                required
              />
              <span className="hint">Mở game → Cài đặt → Tài khoản để xem UID (9 chữ số).</span>
            </div>

            <div className="field-row">
              <div className="field">
                <label className="label" htmlFor="server">
                  Máy chủ
                </label>
                <select
                  id="server"
                  className="select"
                  value={gameServer}
                  onChange={(event) => setGameServer(event.target.value)}
                >
                  {GAME_SERVERS.map((server) => (
                    <option key={server} value={server}>
                      {server}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="label" htmlFor="gameName">
                  Tên nhân vật <em>Tuỳ chọn</em>
                </label>
                <input
                  id="gameName"
                  className="input"
                  placeholder="Lumine"
                  value={gameName}
                  onChange={(event) => setGameName(event.target.value)}
                  maxLength={40}
                />
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor="note">
                Hãy nhập lưu ý kèm số Zalo hoặc link Facebook <em>Tuỳ chọn</em>
              </label>
              <textarea
                id="note"
                className="textarea"
                placeholder="Ví dụ: Không đổi mật khẩu, liên hệ Zalo 0987654321."
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={500}
              />
              <span className="hint">{note.length}/500 ký tự</span>
            </div>

            <div className="summary__note">
              Mẹo: Admin có thể quên đơn của bạn, hãy liên hệ qua Zalo và kèm ảnh chụp đơn để được xử lý nhanh hơn.
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Thanh toán & xác nhận</h2>
            <p className="wizard__sub">Chọn cách thanh toán, kiểm tra lại thông tin rồi gửi đơn.</p>

            <div className="pay-methods">
              <button
                type="button"
                className={`pay-method ${paymentMethod === 'balance' ? 'is-selected' : ''}`}
                onClick={() => setPaymentMethod('balance')}
              >
                <span className="choice__icon">
                  <IconWallet width={18} height={18} />
                </span>
                <span className="pay-method__text">
                  <strong>Dùng số dư ví</strong>
                  <span>Hiện có {formatVnd(balance)} · trừ ngay khi đặt</span>
                </span>
                {paymentMethod === 'balance' && <IconCheck width={17} height={17} style={{ color: 'var(--accent)' }} />}
              </button>
              <button
                type="button"
                className={`pay-method ${paymentMethod === 'transfer' ? 'is-selected' : ''}`}
                onClick={() => setPaymentMethod('transfer')}
              >
                <span className="choice__icon">
                  <IconClock width={18} height={18} />
                </span>
                <span className="pay-method__text">
                  <strong>Chuyển khoản ngân hàng</strong>
                  <span>Liên hệ Admin để được xác nhận đơn càng sớm càng tốt</span>
                </span>
                {paymentMethod === 'transfer' && <IconCheck width={17} height={17} style={{ color: 'var(--accent)' }} />}
              </button>
            </div>

            {insufficient && (
              <div className="summary__note" style={{ marginBottom: 14 }}>
                Số dư chưa đủ {formatVnd(total)}. Hãy{' '}
                <Link href="/tai-khoan?tab=topup" className="text-link">
                  nạp thêm vào ví
                </Link>{' '}
                hoặc chọn chuyển khoản.
              </div>
            )}

            <div className="divider" />

            <div className="summary-row">
              <span>UID game</span>
              <b className="mono">{gameUid || '—'}</b>
            </div>
            <div className="summary-row">
              <span>Máy chủ</span>
              <b>{gameServer}</b>
            </div>
            <div className="summary-row">
              <span>Nhân vật</span>
              <b>{gameName || 'Không cung cấp'}</b>
            </div>
            {note && (
              <div className="summary-row">
                <span>Ghi chú</span>
                <b style={{ maxWidth: '60%' }}>{note}</b>
              </div>
            )}
          </>
        )}

        <div className="wizard-actions">
          {step > 0 ? (
            <button type="button" className="btn btn--ghost" onClick={() => setStep(step - 1)}>
              Quay lại
            </button>
          ) : (
            <Link href="/#bang-gia" className="btn btn--ghost">
              Xem bảng giá
            </Link>
          )}

          {step < 2 ? (
            <button type="button" className="btn btn--primary" onClick={goNext}>
              Tiếp tục <IconArrow width={16} height={16} />
            </button>
          ) : (
            <button type="button" className="btn btn--primary" onClick={submit} disabled={submitting || insufficient}>
              {submitting ? <span className="spinner" /> : `Xác nhận · ${formatVnd(total)}`}
            </button>
          )}
        </div>
      </div>

      <aside className="card summary">
        <div className="summary__head">
          <h3>Tóm tắt đơn</h3>
          <span className="tag">Bước {step + 1}/3</span>
        </div>

        {pickedItems.length === 0 && (
          <div className="summary-row">
            <span>Gói</span>
            <b>Chưa chọn gói nào</b>
          </div>
        )}

        {pickedItems.length === 1 && (
          <>
            <div className="summary-row">
              <span>Dịch vụ</span>
              <b>{pickedItems[0].service.name}</b>
            </div>
            <div className="summary-row">
              <span>Gói</span>
              <b>{pickedItems[0].pkg.name}</b>
            </div>
            <div className="summary-row">
              <span>Thời gian dự kiến</span>
              <b>{pickedItems[0].pkg.duration}</b>
            </div>
          </>
        )}

        {pickedItems.length > 1 && (
          <>
            <div className="summary-row">
              <span>Đơn gộp</span>
              <b>{pickedItems.length} gói · 1 thanh toán</b>
            </div>
            {pickedItems.map((entry) => (
              <div className="summary-row" key={`${entry.service.id}::${entry.pkg.id}`}>
                <span>{entry.service.shortName}</span>
                <b style={{ maxWidth: '64%' }}>
                  {entry.pkg.name} · {formatVnd(entry.pkg.price)}
                </b>
              </div>
            ))}
          </>
        )}

        <div className="summary-row">
          <span>Số dư ví</span>
          <b>{formatVnd(balance)}</b>
        </div>

        <div className="summary-total">
          <span>Tổng thanh toán</span>
          <strong>{formatVnd(total)}</strong>
        </div>

        <ul className="service-card__list mt-2">
          {perks.map((perk) => (
            <li key={perk}>
              <IconCheck width={14} height={14} />
              {perk}
            </li>
          ))}
        </ul>

        <div className="summary__note">
          Email xác nhận sẽ được gửi tới <strong>{user.email}</strong>. Đơn có thể huỷ trước khi thợ bắt đầu.
        </div>
      </aside>
    </div>
  );
}
