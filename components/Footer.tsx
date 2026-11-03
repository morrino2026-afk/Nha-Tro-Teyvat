import Link from 'next/link';
import { IconMail, IconMoon } from './Icons';

export function Footer() {
  return (
    <footer className="site-footer" id="lien-he">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="brand brand--footer">
            <span className="brand__mark">
              <IconMoon width={22} height={22} />
            </span>
            <span className="brand__text">
              <strong>Nhà Trọ Teyvat</strong>
              <small>Cày thuê Genshin tận tâm</small>
            </span>
          </div>
          <p>
            Đội ngũ cày thuê La Hoàn, Ảo Cảnh và Nhà Hát hoạt động từ 2026. Không đổi mật khẩu, không tiêu
            Nguyên Thạch, báo cáo minh bạch sau mỗi đơn.
          </p>
          <a className="footer-mail" href="mailto:nhatroteyvat.support@gmail.com">
            <IconMail width={16} height={16} /> nhatroteyvat.support@gmail.com
          </a>
          <p>
              Zalo: 0357374010
            </p>
        </div>

        <div className="footer-col">
          <h4>Dịch vụ</h4>
          <Link href="/dat-don">La Hoàn Thâm Cảnh</Link>
          <Link href="/dat-don">Nhà Hát Kịch Ảo Tưởng</Link>
          <Link href="/dat-don">Ảo Cảnh Kỳ Bí</Link>
          <Link href="/#bang-gia">Bảng giá</Link>
        </div>

        <div className="footer-col">
          <h4>Tài khoản</h4>
          <Link href="/dang-nhap">Đăng nhập</Link>
          <Link href="/dang-ky">Tạo tài khoản</Link>
          <Link href="/quen-mat-khau">Quên mật khẩu</Link>
          <Link href="/tai-khoan">Lịch sử đơn hàng</Link>
        </div>

        <div className="footer-col">
          <h4>Hỗ trợ</h4>
          <Link href="/#quy-trinh">Quy trình làm việc</Link>
          <Link href="/#faq">Câu hỏi thường gặp</Link>
          <a href="mailto:nhatroteyvat.support@gmail.com">Gửi email hỗ trợ</a>
          <span className="footer-muted">Hỗ trợ 8:00 – 23:00 mỗi ngày</span>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Nhà Trọ Teyvat. Website fan-made, không liên kết với HoYoverse.</span>
        <span className="footer-muted">Genshin Impact là thương hiệu của HoYoverse.</span>
      </div>
    </footer>
  );
}
