import Link from 'next/link';
import { OrderWizard } from '@/components/OrderWizard';

export const metadata = {
  title: 'Đặt đơn cày thuê — Mộng Nguyệt Studio',
  description: 'Chọn gói La Hoàn, Nhà Hát hoặc Ảo Cảnh — gộp nhiều gói thành một đơn thanh toán duy nhất.',
};

export default function OrderPage() {
  return (
    <div className="page-shell">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Trang chủ</Link>
          <span>/</span>
          <span>Đặt đơn</span>
        </div>
        <div className="page-head">
          <span className="eyebrow">Đặt đơn</span>
          <h1>Bắt đầu đơn cày của bạn</h1>
          <p>Ba bước ngắn gọn. Đơn được xác nhận qua email ngay sau khi gửi.</p>
        </div>
        <OrderWizard />
      </div>
    </div>
  );
}
