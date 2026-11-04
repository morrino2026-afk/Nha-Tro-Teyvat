'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/Toast';
import { IconGoogle } from '@/components/Icons';
import { authErrorMessage } from '@/lib/authErrors';
import { signInGoogle, signUpEmail } from '@/lib/api';
import { PolicyAgreement } from '@/components/PolicyAgreement';

export default function RegisterPage() {
  const router = useRouter();
  const { user, setUser, demo, acceptPolicies } = useAuth();
  const { notify } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) router.replace('/tai-khoan');
  }, [user, router]);

  async function handleSubmit(event: React.FormEvent) {
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
    if (!agree) {
      setError('Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.');
      return;
    }
    setLoading(true);
    try {
      const session = await signUpEmail(email, password, name);
      await acceptPolicies();
      if (session) setUser(session);
      notify('Tạo tài khoản thành công!');
      router.replace('/tai-khoan');
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    if (!agree) {
      setError('Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.');
      return;
    }
    setGoogleLoading(true);
    try {
      const session = await signInGoogle();
      await acceptPolicies();
      if (session) setUser(session);
      notify('Tạo tài khoản bằng Google thành công!');
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
          <span className="eyebrow" style={{ marginBottom: 10 }}>Bắt đầu hành trình</span>
          <h1>Tạo tài khoản</h1>
          <p>Đặt đơn, nạp ví và theo dõi mọi thứ ở một nơi.</p>
        </div>

        {error && <div className="error-text">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="label" htmlFor="name">
              Tên hiển thị
            </label>
            <input
              id="name"
              className="input"
              placeholder="Nhà lữ hành"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={40}
            />
          </div>

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

          <div className="field-row">
            <div className="field">
              <label className="label" htmlFor="password">
                Mật khẩu
              </label>
              <input
                id="password"
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
              <label className="label" htmlFor="confirm">
                Nhập lại
              </label>
              <input
                id="confirm"
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

          <PolicyAgreement checked={agree} onChange={setAgree} required />

          <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Tạo tài khoản'}
          </button>
        </form>

        <div className="auth-divider">hoặc</div>

        <button type="button" className="google-btn" onClick={handleGoogle} disabled={googleLoading}>
          {googleLoading ? <span className="spinner" /> : <IconGoogle />}
          Tiếp tục với Google
        </button>

        <p className="auth-foot">
          Đã có tài khoản? <Link href="/dang-nhap">Đăng nhập</Link>
        </p>

        {demo && (
          <div className="demo-note">
            Chế độ demo: tài khoản mới sẽ được lưu trong trình duyệt. Tài khoản quản trị có sẵn:{' '}
            <code>admin@demo.vn</code> / <code>123456</code>.
          </div>
        )}
      </div>
    </div>
  );
}
