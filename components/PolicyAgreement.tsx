'use client';

import Link from 'next/link';

export function PolicyAgreement({
  checked,
  onChange,
  required = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
}) {
  return (
    <label className="checkbox">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        required={required}
      />
      <span>
        Tôi đã đọc và đồng ý với <Link href="/dieu-khoan" className="text-link">Điều khoản dịch vụ</Link> và{' '}
        <Link href="/chinh-sach-bao-mat" className="text-link">Chính sách bảo mật</Link> của Mộng Nguyệt Studio.
      </span>
    </label>
  );
}
