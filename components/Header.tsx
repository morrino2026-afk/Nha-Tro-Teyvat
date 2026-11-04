'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthProvider';
import { ThemeControl } from './ThemeControl';
import { IconArrow, IconClose, IconLogout, IconMenu, IconMoon, IconUser } from './Icons';

const NAV = [
  { href: '/', label: 'Trang chủ' },
  { href: '/#dich-vu', label: 'Dịch vụ' },
  { href: '/#bang-gia', label: 'Bảng giá' },
  { href: '/#quy-trinh', label: 'Quy trình' },
  { href: '/#faq', label: 'Hỏi đáp' },
];

export function Header() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(event.target as Node)) setUserOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const initial = (user?.displayName || user?.email || '?').trim().charAt(0).toUpperCase();

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Mộng Nguyệt Studio — trang chủ">
          <span className="brand__mark">
            <IconMoon width={22} height={22} />
          </span>
          <span className="brand__text">
            <strong>Mộng Nguyệt Studio</strong>
            <small>Cày thuê Genshin</small>
          </span>
        </Link>

        <nav className="nav-desktop" aria-label="Điều hướng chính">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href ? 'is-active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <ThemeControl />
          {loading ? (
            <span className="skeleton-pill" aria-hidden />
          ) : user ? (
            <div className="user-menu" ref={userRef}>
              <button
                type="button"
                className="user-chip"
                onClick={() => setUserOpen((prev) => !prev)}
                aria-expanded={userOpen}
                aria-haspopup="menu"
              >
                <span className="avatar">{initial}</span>
                <span className="user-chip__name">{user.displayName || user.email}</span>
              </button>
              {userOpen && (
                <div className="dropdown" role="menu">
                  <div className="dropdown__head">
                    <strong>{user.displayName || 'Người chơi'}</strong>
                    <span>{user.email}</span>
                  </div>
                  <Link href="/tai-khoan" className="dropdown__item" role="menuitem">
                    <IconUser width={16} height={16} /> Tài khoản của tôi
                  </Link>
                  <Link href="/tai-khoan?tab=topup" className="dropdown__item" role="menuitem">
                    <IconArrow width={16} height={16} /> Nạp tiền
                  </Link>
                  <button type="button" className="dropdown__item" role="menuitem" onClick={() => void logout()}>
                    <IconLogout width={16} height={16} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-actions">
              <Link href="/dang-nhap" className="btn btn--ghost btn--sm">
                Đăng nhập
              </Link>
              <Link href="/dat-don" className="btn btn--primary btn--sm">
                Đặt đơn
                <IconArrow width={16} height={16} />
              </Link>
            </div>
          )}

          <button
            type="button"
            className="icon-btn menu-toggle"
            aria-label="Mở menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? <IconClose width={20} height={20} /> : <IconMenu width={20} height={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="mobile-menu__link">
              {item.label}
            </Link>
          ))}
          <div className="mobile-menu__actions">
            {user ? (
              <>
                <Link href="/tai-khoan" className="btn btn--ghost">
                  Tài khoản
                </Link>
                <button type="button" className="btn btn--ghost" onClick={() => void logout()}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link href="/dang-nhap" className="btn btn--ghost">
                  Đăng nhập
                </Link>
                <Link href="/dang-ky" className="btn btn--primary">
                  Tạo tài khoản
                </Link>
              </>
            )}
            <Link href="/dat-don" className="btn btn--primary">
              Đặt đơn ngay
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
