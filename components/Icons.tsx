import type { SVGProps } from 'react';

type Props = SVGProps<SVGSVGElement>;

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export function IconMoon(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
      <path d="M17 4.5h.01M19.5 7h.01" />
    </svg>
  );
}

export function IconAbyss(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2.5 4 6v6c0 5 3.4 8.2 8 9.5 4.6-1.3 8-4.5 8-9.5V6l-8-3.5Z" />
      <path d="M12 7v6M9 10h6" />
    </svg>
  );
}

export function IconTheater(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 4h18v7a9 9 0 0 1-18 0V4Z" />
      <path d="M7 8.5c1 1.2 2 1.2 3 0M14 8.5c1 1.2 2 1.2 3 0M8.5 15c2.3 1.6 4.7 1.6 7 0" />
    </svg>
  );
}

export function IconVision(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconArrow(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconCheck(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

export function IconSpark(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
      <path d="M18.5 15.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6Z" />
    </svg>
  );
}

export function IconUser(props: Props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20c.9-3.6 3.8-5.5 7.5-5.5s6.6 1.9 7.5 5.5" />
    </svg>
  );
}

export function IconMail(props: Props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function IconLock(props: Props) {
  return (
    <svg {...base} {...props}>
      <rect x="4.5" y="10" width="15" height="10" rx="3" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
    </svg>
  );
}

export function IconLogout(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
      <path d="M10 8l-4 4 4 4M6 12h9" />
    </svg>
  );
}

export function IconMenu(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconClose(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconCopy(props: Props) {
  return (
    <svg {...base} {...props}>
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M15 6.5V5.5A1.5 1.5 0 0 0 13.5 4h-8A1.5 1.5 0 0 0 4 5.5v8A1.5 1.5 0 0 0 5.5 15h1" />
    </svg>
  );
}

export function IconClock(props: Props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function IconWallet(props: Props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="6" width="18" height="13" rx="3.5" />
      <path d="M3 10h18M16.5 14.5h.01" />
    </svg>
  );
}

export function IconShield(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3 5 6v6c0 4.4 3 7.4 7 8.5 4-1.1 7-4.1 7-8.5V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function IconGoogle(props: Props) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden {...props}>
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.2h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.2-2.1 3.7-5.1 3.7-8.7Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.8-2.9l-3.7-2.9c-1 .7-2.3 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5L1.5 17.3C3.4 21.2 7.4 24 12 24Z"
      />
      <path fill="#FBBC05" d="M5.3 14.4A7 7 0 0 1 5 12c0-.8.1-1.6.4-2.4L1.5 6.7A12 12 0 0 0 0 12c0 1.9.5 3.7 1.5 5.3l3.8-2.9Z" />
      <path
        fill="#EA4335"
        d="M12 4.7c2.2 0 3.7.9 4.6 1.7l3.3-3.2C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.8 1.5 6.7l3.8 2.9c.9-2.8 3.6-4.9 6.7-4.9Z"
      />
    </svg>
  );
}
