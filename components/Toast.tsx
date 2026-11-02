'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { IconCheck, IconClose } from './Icons';

type Tone = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  tone: Tone;
}

interface ToastState {
  notify: (message: string, tone?: Tone) => void;
}

const ToastContext = createContext<ToastState | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const notify = useCallback((message: string, tone: Tone = 'success') => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {items.map((item) => (
          <div key={item.id} className={`toast toast--${item.tone}`}>
            <span className="toast__icon">
              {item.tone === 'success' ? <IconCheck width={16} height={16} /> : <IconClose width={16} height={16} />}
            </span>
            <span>{item.message}</span>
            <button
              type="button"
              className="toast__close"
              aria-label="Đóng thông báo"
              onClick={() => setItems((prev) => prev.filter((entry) => entry.id !== item.id))}
            >
              <IconClose width={14} height={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastState {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast phải được dùng bên trong ToastProvider');
  return context;
}
