import { AdminDashboard } from '@/components/AdminDashboard';

export const metadata = {
  title: 'Quản trị — Mộng Nguyệt Studio',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-head">
          <span className="eyebrow">Nội bộ</span>
          <h1>Quản trị cửa hàng</h1>
          <p>Xử lý đơn cày và duyệt yêu cầu nạp tiền của khách.</p>
        </div>
        <AdminDashboard />
      </div>
    </div>
  );
}
