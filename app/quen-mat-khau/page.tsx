'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/Toast';
import { IconArrow, IconCheck, IconMail } from '@/components/Icons';
import { authErrorMessage } from '@/lib/authErrors';
import { resetPassword, sendOtp } from '@/lib/api';

export default function ForgotPasswordPage() {
  const { notify } = useToast();
  const [step, setStep] = useState<'email' | 'reset' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  async function requestOtp(event?: React.FormEvent) {
    event?.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const result = await sendOtp(email);
      setInfo(result.message);
      setStep('reset');
      setCountdown(60);
      notify(result.devCode ? `Mã OTP demo: ${result.devCode}` : 'Đã gửi OTP tới email của bạn', 'info');
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Mật khẩu cần ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirm) {
      setError('Mật khẩu nhập lại chưa khớp.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email, code, password);
      setStep('done');
      notify('Đặt lại mật khẩu thành công!');
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {step !== 'done' && (
          <div className="auth-card__head">
            <span className="eyebrow" style={{ marginBottom: 10 }}>Khôi phục tài khoản</span>
            <h1>Quên mật khẩu</h1>
            <p>
              {step === 'email'
                ? 'Nhập email đăng ký, chúng tôi sẽ gửi mã OTP 6 số qua Gmail.'
                : `Mã OTP đã được gửi tới ${email}. Mã có hiệu lực 10 phút.`}
            </p>
          </div>
        )}

        {error && <div className="error-text">{error}</div>}

        {step === 'email' && (
          <form onSubmit={requestOtp}>
            <div className="field">
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="input"
                type="email"
                autoComplete="email"
                placeholder="ban@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Gửi mã OTP'}
            </button>
            <p className="auth-foot">
              <Link href="/dang-nhap">Quay lại đăng nhập</Link>
            </p>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleReset}>
            {info && <div className="demo-note" style={{ marginTop: 0, marginBottom: 16 }}>{info}</div>}

            <div className="field">
              <label className="label" htmlFor="code">
                Mã OTP <em>6 chữ số</em>
              </label>
              <input
                id="code"
                className="input mono"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="••••••"
                maxLength={6}
                style={{ letterSpacing: '0.5em', fontSize: '1.1rem', textAlign: 'center' }}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                required
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label className="label" htmlFor="new-password">
                  Mật khẩu mới
                </label>
                <input
                  id="new-password"
                  className="input"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label className="label" htmlFor="confirm-password">
                  Nhập lại
                </label>
                <input
                  id="confirm-password"
                  className="input"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Nhập lại mật khẩu"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Đặt lại mật khẩu'}
            </button>

            <div className="spread mt-2" style={{ fontSize: '0.8rem' }}>
              <button
                type="button"
                className="text-link"
                style={{ background: 'none', border: 0, padding: 0 }}
                onClick={() => void requestOtp()}
                disabled={countdown > 0 || loading}
              >
                {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã'}
              </button>
              <span className="muted" style={{ fontSize: '0.76rem' }}>
                <IconMail width={13} height={13} style={{ display: 'inline', verticalAlign: '-2px' }} /> Kiểm
                tra cả hộp thư rác
              </span>
            </div>
          </form>
        )}

        {step === 'done' && (
          <div className="success-card" style={{ padding: '10px 0' }}>
            <div className="success-card__icon">
              <IconCheck width={30} height={30} />
            </div>
            <h1 style={{ fontSize: '1.5rem' }}>Đã đặt lại mật khẩu</h1>
            <p className="muted">Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.</p>
            <Link href="/dang-nhap" className="btn btn--primary mt-2">
              Đăng nhập <IconArrow width={16} height={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
