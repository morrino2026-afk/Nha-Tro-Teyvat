import Link from 'next/link';

export const metadata = {
  title: 'Điều khoản dịch vụ — Mộng Nguyệt Studio',
  description: 'Điều khoản sử dụng dịch vụ của Mộng Nguyệt Studio.',
};

export default function TermsPage() {
  return (
    <div className="page-shell">
      <article className="container card legal-copy">
        <span className="eyebrow">Cập nhật ngày 04/11/2026</span>
        <h1>Điều khoản dịch vụ</h1>
        <p>
          Điều khoản này áp dụng khi bạn truy cập website, tạo tài khoản hoặc đặt dịch vụ tại Nhà Trọ
          Mộng Nguyệt Studio. Khi sử dụng dịch vụ, bạn xác nhận đã đọc và đồng ý với các nội dung dưới đây cùng{' '}
          <Link href="/chinh-sach-bao-mat" className="text-link">Chính sách bảo mật</Link>.
        </p>

        <h2>1. Tài khoản và thông tin đặt dịch vụ</h2>
        <p>
          Bạn cần cung cấp thông tin chính xác, bảo vệ tài khoản và chịu trách nhiệm với hoạt động phát
          sinh từ tài khoản của mình. Hãy kiểm tra UID, máy chủ, gói dịch vụ và ghi chú trước khi xác nhận
          đơn. Mộng Nguyệt Studio không yêu cầu mật khẩu, mã xác thực hoặc thông tin đăng nhập trò chơi; không
          gửi những thông tin này qua website hay cho nhân viên.
        </p>

        <h2>2. Đơn hàng và thanh toán</h2>
        <p>
          Giá, phạm vi công việc và phương thức thanh toán được hiển thị khi đặt đơn. Đơn chỉ được xử lý
          sau khi được xác nhận theo trạng thái hiển thị trên tài khoản. Bạn có thể theo dõi trạng thái
          đơn và giao dịch trong khu vực tài khoản. Nếu cần điều chỉnh hoặc hủy đơn, hãy liên hệ hỗ trợ
          sớm; yêu cầu được xem xét theo phần công việc đã thực hiện và khoản thanh toán đã phát sinh.
        </p>

        <h2>3. Trách nhiệm và giới hạn dịch vụ</h2>
        <p>
          Bạn phải có quyền sử dụng tài khoản trò chơi được cung cấp và tự tìm hiểu các quy định của nhà
          phát hành trò chơi. Mộng Nguyệt Studio là dịch vụ độc lập, không thuộc hoặc được HoYoverse bảo trợ.
          Việc sử dụng dịch vụ bên thứ ba có thể chịu các quy định riêng của trò chơi; chúng tôi không
          thể bảo đảm quyết định hoặc kết quả do nhà phát hành đưa ra.
        </p>
        <p>
          Chúng tôi nỗ lực thực hiện đúng nội dung đơn đã xác nhận và không chủ động thay đổi mật khẩu
          hoặc sử dụng Nguyên Thạch của bạn. Hãy liên hệ hỗ trợ nếu phát hiện sai lệch hoặc vấn đề trong
          quá trình thực hiện.
        </p>

        <h2>4. Sử dụng website</h2>
        <p>
          Không sử dụng website để gian lận, gây gián đoạn, truy cập trái phép, hoặc cung cấp thông tin
          giả mạo. Chúng tôi có thể tạm ngừng xử lý giao dịch khi cần xác minh thông tin, bảo vệ tài khoản
          hoặc tuân thủ nghĩa vụ pháp luật; khi phù hợp, chúng tôi sẽ thông báo qua thông tin liên hệ của
          tài khoản.
        </p>

        <h2>5. Cập nhật điều khoản và liên hệ</h2>
        <p>
          Điều khoản có thể được cập nhật khi dịch vụ hoặc yêu cầu pháp luật thay đổi. Phiên bản mới sẽ
          được đăng tại trang này; nếu nội dung thay đổi, bạn cần xác nhận lại trước khi tiếp tục sử dụng
          các chức năng dịch vụ. Liên hệ{' '}
          <a className="text-link" href="mailto:nhatroteyvat.support@gmail.com">
            nhatroteyvat.support@gmail.com
          </a>{' '}
          nếu bạn có câu hỏi.
        </p>
      </article>
    </div>
  );
}
