'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEMO_MODE, firebaseAuth } from '@/lib/firebaseClient';
import { demoSession } from '@/lib/demo';
import { signOut as apiSignOut, type SessionUser } from '@/lib/api';

interface AuthState {
  user: SessionUser | null;
  loading: boolean;
  demo: boolean;
  setUser: (user: SessionUser | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

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

  const logout = useCallback(async () => {
    await apiSignOut();
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, loading, demo: DEMO_MODE, setUser, logout }),
    [user, loading, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth phải được dùng bên trong AuthProvider');
  return context;
}
