import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { ToastProvider } from '@/components/Toast';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Mộng Nguyệt Studio',
  description:
    'Dịch vụ cày thuê Genshin Impact uy tín: La Hoàn Thâm Cảnh 36 sao, Nhà Hát Kịch Ảo Tưởng và Ảo Cảnh Kỳ Bí. Không đổi mật khẩu, báo cáo minh bạch, thanh toán bằng ví hoặc chuyển khoản.',
  keywords: ['cày thuê genshin', 'la hoàn', 'nhà hát kịch ảo tưởng', 'ảo cảnh', 'boost genshin'],
  openGraph: {
    title: 'Cày thuê Genshin Impact',
    description: 'La Hoàn 36★, Nhà Hát full màn, Ảo Cảnh phá đảo. Đặt đơn trong 2 phút.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f0c16',
};

const themeScript = `
(function(){
  try {
    var hue = Number(localStorage.getItem('vongnguyet.hue'));
    if (hue >= 210 && hue <= 350) document.documentElement.style.setProperty('--hue', String(hue));
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="0C97sSjOKWYynWyNPl-BpJvjKvvxm8LqMkDkhzqVIkw" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AuthProvider>
          <ToastProvider>
            <div className="aurora" aria-hidden>
              <span className="aurora__blob aurora__blob--a" />
              <span className="aurora__blob aurora__blob--b" />
              <span className="aurora__blob aurora__blob--c" />
              <span className="aurora__grain" />
            </div>
            <Header />
            <main>{children}</main>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
