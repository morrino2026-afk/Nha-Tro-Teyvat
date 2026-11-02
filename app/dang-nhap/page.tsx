'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/Toast';
import { IconGoogle, IconLock, IconMail } from '@/components/Icons';
import { authErrorMessage } from '@/lib/authErrors';
import { signInEmail, signInGoogle } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { user, setUser, demo } = useAuth();
  const { notify } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) router.replace('/tai-khoan');
  }, [user, router]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const session = await signInEmail(email, password);
      if (session) setUser(session);
      notify('Đăng nhập thành công, chào mừng trở lại!');
      router.replace('/tai-khoan');
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setGoogleLoading(true);
    try {
      const session = await signInGoogle();
      if (session) setUser(session);
      notify('Đăng nhập Google thành công!');
      router.replace('/tai-khoan');
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__head">
          <span className="eyebrow" style={{ marginBottom: 10 }}>Chào mừng trở lại</span>
          <h1>Đăng nhập</h1>
          <p>Theo dõi đơn cày, số dư ví và lịch sử giao dịch của bạn.</p>
        </div>

        {error && <div className="error-text">{error}</div>}

        <form onSubmit={handleSubmit}>
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

          <div className="field">
            <label className="label" htmlFor="password">
              Mật khẩu
              <Link href="/quen-mat-khau" className="text-link" style={{ fontSize: '0.76rem' }}>
                Quên mật khẩu?
              </Link>
            </label>
            <div className="input-wrap">
              <input
                id="password"
                className="input"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                type="button"
                className="input-wrap__btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                <IconLock width={17} height={17} />
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Đăng nhập'}
          </button>
        </form>

        <div className="auth-divider">hoặc tiếp tục với</div>

        <button type="button" className="google-btn" onClick={handleGoogle} disabled={googleLoading}>
          {googleLoading ? <span className="spinner" /> : <IconGoogle />}
          Đăng nhập bằng Google
        </button>

        <p className="auth-foot">
          Chưa có tài khoản? <Link href="/dang-ky">Tạo tài khoản mới</Link>
        </p>

        {demo && (
          <div className="demo-note">
            <strong>Chế độ demo</strong> — chưa cấu hình Firebase nên dữ liệu chỉ lưu trong trình duyệt.
            <br />
            Email: <code>admin@demo.vn</code> · Mật khẩu: <code>123456</code> (có sẵn đơn mẫu, quyền admin).
            <br />
            <button
              type="button"
              className="text-link"
              style={{ background: 'none', border: 0, padding: 0, marginTop: 6 }}
              onClick={() => {
                setEmail('admin@demo.vn');
                setPassword('123456');
              }}
            >
              Điền sẵn tài khoản demo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
