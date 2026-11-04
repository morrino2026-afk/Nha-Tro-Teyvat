'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { DEMO_MODE, firebaseAuth } from '@/lib/firebaseClient';
import { demoSession } from '@/lib/demo';
import {
  acceptPolicies as savePolicyAcceptance,
  hasAcceptedPolicies,
  signOut as apiSignOut,
  type SessionUser,
} from '@/lib/api';
import Link from 'next/link';

interface AuthState {
  user: SessionUser | null;
  loading: boolean;
  demo: boolean;
  policyAccepted: boolean;
  policyLoading: boolean;
  setUser: (user: SessionUser | null) => void;
  acceptPolicies: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [policyUserId, setPolicyUserId] = useState<string | null>(null);

  useEffect(() => {
    if (DEMO_MODE) {
      setUser(demoSession());
      setLoading(false);
      return;
    }
    let unsubscribe = () => {};
    import('firebase/auth')
      .then(({ onAuthStateChanged }) => {
        unsubscribe = onAuthStateChanged(firebaseAuth(), (firebaseUser) => {
          setUser(
            firebaseUser
              ? {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email || '',
                  displayName: firebaseUser.displayName || (firebaseUser.email || '').split('@')[0],
                }
              : null,
          );
          setLoading(false);
        });
      })
      .catch((error) => {
        console.error('[auth]', error);
        setLoading(false);
      });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;
    if (!user) {
      setPolicyAccepted(false);
      setPolicyLoading(false);
      setPolicyUserId(null);
      return () => {
        active = false;
      };
    }

    setPolicyAccepted(false);
    setPolicyLoading(true);
    setPolicyUserId(user.uid);
    hasAcceptedPolicies()
      .then((accepted) => {
        if (active) setPolicyAccepted((current) => current || accepted);
      })
      .catch((error) => {
        console.error('[policies]', error);
        if (active) setPolicyAccepted(false);
      })
      .finally(() => {
        if (active) setPolicyLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user?.uid]);

  const acceptPolicies = useCallback(async () => {
    await savePolicyAcceptance();
    setPolicyAccepted(true);
  }, []);

  const logout = useCallback(async () => {
    await apiSignOut();
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      demo: DEMO_MODE,
      policyAccepted,
      policyLoading,
      setUser,
      acceptPolicies,
      logout,
    }),
    [user, loading, policyAccepted, policyLoading, acceptPolicies, logout],
  );
  const viewingPolicy = pathname === '/dieu-khoan' || pathname === '/chinh-sach-bao-mat';
  const policyStatusReady = policyUserId === user?.uid;

  return (
    <AuthContext.Provider value={value}>
      {user && !viewingPolicy && (!policyStatusReady || policyLoading) ? (
        <div className="page-loader">
          <span className="spinner" /> Đang kiểm tra điều khoản…
        </div>
      ) : user && !viewingPolicy && !policyAccepted ? (
        <PolicyConsentGate acceptPolicies={acceptPolicies} logout={logout} />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

function PolicyConsentGate({
  acceptPolicies,
  logout,
}: {
  acceptPolicies: () => Promise<void>;
  logout: () => Promise<void>;
}) {
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleAccept() {
    if (!checked) {
      setError('Vui lòng đọc và đồng ý với cả hai chính sách để tiếp tục.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await acceptPolicies();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể lưu xác nhận. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-card" aria-labelledby="policy-consent-title">
        <div className="auth-card__head">
          <span className="eyebrow">Cần xác nhận</span>
          <h1 id="policy-consent-title">Đồng ý chính sách để tiếp tục</h1>
          <p>Vui lòng đọc và xác nhận các chính sách hiện hành trước khi sử dụng dịch vụ.</p>
        </div>
        {error && <div className="error-text" role="alert">{error}</div>}
        <label className="checkbox">
          <input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} />
          <span>
            Tôi đã đọc và đồng ý với <Link href="/dieu-khoan" className="text-link">Điều khoản dịch vụ</Link> và{' '}
            <Link href="/chinh-sach-bao-mat" className="text-link">Chính sách bảo mật</Link> của Mộng Nguyệt Studio.
          </span>
        </label>
        <button
          type="button"
          className="btn btn--primary btn--block"
          onClick={handleAccept}
          disabled={saving}
        >
          {saving ? <span className="spinner" /> : 'Đồng ý và tiếp tục'}
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--block"
          onClick={async () => {
            setError('');
            try {
              await logout();
            } catch (reason) {
              setError(reason instanceof Error ? reason.message : 'Không thể đăng xuất. Vui lòng thử lại.');
            }
          }}
          disabled={saving}
          style={{ marginTop: 10 }}
        >
          Đăng xuất
        </button>
      </section>
    </div>
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth phải được dùng bên trong AuthProvider');
  return context;
}
