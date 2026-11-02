import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="page-shell">
      <div className="container" style={{ maxWidth: 640, textAlign: 'center' }}>
        <span className="eyebrow" style={{ justifyContent: 'center' }}>404</span>
        <h1 style={{ fontSize: '2rem' }}>Trang này đã đi lạc vào Ảo Cảnh</h1>
        <p className="muted">
          Đường dẫn bạn mở không tồn tại hoặc đã được đổi. Hãy quay về trang chủ hoặc đặt đơn trực tiếp.
        </p>
        <div className="row" style={{ justifyContent: 'center', marginTop: 18 }}>
          <Link href="/" className="btn btn--primary">
            Về trang chủ
          </Link>
          <Link href="/dat-don" className="btn btn--ghost">
            Đặt đơn
          </Link>
        </div>
      </div>
    </div>
  );
}
