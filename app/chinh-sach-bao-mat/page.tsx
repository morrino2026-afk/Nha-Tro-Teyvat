import Link from 'next/link';

export const metadata = {
  title: 'Chính sách bảo mật — Mộng Nguyệt Studio',
  description: 'Cách Mộng Nguyệt Studio thu thập, sử dụng và bảo vệ thông tin của bạn.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="page-shell">
      <article className="container card legal-copy">
        <span className="eyebrow">Cập nhật ngày 04/11/2026</span>
        <h1>Chính sách bảo mật</h1>
        <p>
          Chính sách này giải thích cách Mộng Nguyệt Studio xử lý thông tin khi bạn sử dụng website và dịch
          vụ. Việc sử dụng dịch vụ đồng thời chịu sự điều chỉnh của{' '}
          <Link href="/dieu-khoan" className="text-link">Điều khoản dịch vụ</Link>.
        </p>

        <h2>1. Thông tin chúng tôi thu thập</h2>
        <ul>
          <li>Thông tin tài khoản: email, tên hiển thị và mã định danh tài khoản xác thực.</li>
          <li>
            Thông tin đơn hàng: UID trò chơi, máy chủ, tên trong trò chơi (nếu cung cấp), gói đã chọn,
            ghi chú và trạng thái thanh toán.
          </li>
          <li>
            Thông tin xác nhận đồng ý chính sách, gồm phiên bản đã chấp nhận và thời điểm xác nhận.
          </li>
          <li>
            Thông tin kỹ thuật cần thiết để vận hành và bảo vệ website, chẳng hạn dữ liệu phiên đăng nhập
            do dịch vụ xác thực quản lý.
          </li>
        </ul>
        <p>
          Không gửi mật khẩu trò chơi, mã xác thực một lần, thông tin thẻ ngân hàng hoặc dữ liệu không
          cần thiết trong ghi chú đơn hàng.
        </p>

        <h2>2. Mục đích sử dụng</h2>
        <p>
          Thông tin được dùng để tạo và bảo vệ tài khoản, tiếp nhận và xử lý đơn hàng, ghi nhận giao dịch,
          hỗ trợ khách hàng, gửi thông báo liên quan đến đơn và ngăn chặn hành vi lạm dụng. Chúng tôi
          không bán thông tin cá nhân của bạn.
        </p>

        <h2>3. Dịch vụ bên thứ ba và chia sẻ thông tin</h2>
        <p>
          Website sử dụng Firebase để xác thực và vận hành dữ liệu; khi bạn chọn Google, thông tin xác
          thực cần thiết được xử lý bởi Google theo chính sách của họ. Nhà cung cấp dịch vụ gửi email
          có thể xử lý địa chỉ email và nội dung thông báo liên quan đến đơn. Thông tin chỉ được chia sẻ
          với nhà cung cấp cần thiết để vận hành dịch vụ, hoặc khi pháp luật yêu cầu. Nhân sự có thẩm
          quyền có thể xem thông tin đơn để thực hiện hỗ trợ và dịch vụ.
        </p>

        <h2>4. Lưu trữ và bảo vệ dữ liệu</h2>
        <p>
          Chúng tôi áp dụng biện pháp kỹ thuật và quyền truy cập phù hợp để bảo vệ dữ liệu. Thông tin
          được lưu trong thời gian cần thiết cho các mục đích nêu trên, xử lý giao dịch và đáp ứng nghĩa
          vụ pháp luật; sau đó sẽ được xóa hoặc ẩn danh khi phù hợp. Không có phương thức truyền hoặc lưu
          trữ nào bảo đảm an toàn tuyệt đối.
        </p>

        <h2>5. Quyền của bạn và liên hệ</h2>
        <p>
          Bạn có thể yêu cầu xem, sửa hoặc xóa thông tin cá nhân bằng cách liên hệ{' '}
          <a className="text-link" href="mailto:nhatroteyvat.support@gmail.com">
            nhatroteyvat.support@gmail.com
          </a>
          . Một số dữ liệu có thể cần được giữ lại để hoàn tất giao dịch hoặc tuân thủ pháp luật. Chính
          sách này có thể được cập nhật; phiên bản mới sẽ được công bố tại trang này và có thể yêu cầu
          bạn xác nhận lại trước khi tiếp tục sử dụng dịch vụ.
        </p>
      </article>
    </div>
  );
}
