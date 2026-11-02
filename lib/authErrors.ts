const MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'Email không hợp lệ.',
  'auth/user-disabled': 'Tài khoản này đã bị khoá.',
  'auth/user-not-found': 'Không tìm thấy tài khoản với email này.',
  'auth/wrong-password': 'Mật khẩu không đúng.',
  'auth/invalid-credential': 'Email hoặc mật khẩu không đúng.',
  'auth/invalid-login-credentials': 'Email hoặc mật khẩu không đúng.',
  'auth/email-already-in-use': 'Email này đã được đăng ký. Hãy đăng nhập hoặc đặt lại mật khẩu.',
  'auth/weak-password': 'Mật khẩu quá yếu, cần ít nhất 6 ký tự.',
  'auth/popup-closed-by-user': 'Bạn đã đóng cửa sổ đăng nhập Google.',
  'auth/popup-blocked': 'Trình duyệt chặn cửa sổ đăng nhập. Hãy cho phép popup cho trang này.',
  'auth/cancelled-popup-request': 'Yêu cầu đăng nhập đã bị huỷ, vui lòng thử lại.',
  'auth/unauthorized-domain':
    'Tên miền hiện tại chưa được thêm vào Firebase Authentication → Settings → Authorized domains.',
  'auth/operation-not-allowed': 'Phương thức đăng nhập này chưa được bật trong Firebase Console.',
  'auth/too-many-requests': 'Bạn thử quá nhiều lần. Vui lòng đợi vài phút rồi thử lại.',
  'auth/network-request-failed': 'Không kết nối được máy chủ, kiểm tra mạng và thử lại.',
};

export function authErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code?: string }).code || '');
    if (MESSAGES[code]) return MESSAGES[code];
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Đã có lỗi xảy ra, vui lòng thử lại.';
}
