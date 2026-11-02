import { AccountDashboard } from '@/components/AccountDashboard';

export const metadata = {
  title: 'Tài khoản của tôi — Nhà Trọ Teyvat',
  description: 'Quản lý số dư, lịch sử đặt hàng và lịch sử nạp tiền.',
};

export default function AccountPage() {
  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-head">
          <span className="eyebrow">Khu vực của bạn</span>
          <h1>Tài khoản</h1>
          <p>Toàn bộ đơn hàng, giao dịch và thông tin cá nhân ở cùng một chỗ.</p>
        </div>
        <AccountDashboard />
      </div>
    </div>
  );
}
