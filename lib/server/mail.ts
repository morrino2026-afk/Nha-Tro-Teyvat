import nodemailer, { type Transporter } from 'nodemailer';
import { formatVnd } from '../catalog';
import type { Order, Topup } from '../types';
import { orderHandoverNote } from './respan';

let cached: Transporter | null = null;

export function mailConfigured(): boolean {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

function transport(): Transporter {
  if (cached) return cached;
  cached = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, ''),
    },
  });
  return cached;
}

const SITE = process.env.NEXT_PUBLIC_SITE_NAME || 'Nhà Trọ Teyvat';
const ACCENT = '#c9a7ff';

function shell(title: string, body: string) {
  return `<!doctype html>
<html lang="vi"><body style="margin:0;padding:0;background:#0f0c16;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e9e5f2">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f0c16;padding:28px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#17131f;border:1px solid #2b2436;border-radius:18px;overflow:hidden">
        <tr><td style="padding:22px 26px;border-bottom:1px solid #2b2436;background:linear-gradient(120deg,#241b34,#1a1524)">
          <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:${ACCENT}">${SITE}</div>
          <div style="font-size:20px;margin-top:6px;font-weight:600">${title}</div>
        </td></tr>
        <tr><td style="padding:24px 26px;font-size:14px;line-height:1.7;color:#d9d3e6">${body}</td></tr>
        <tr><td style="padding:18px 26px;border-top:1px solid #2b2436;font-size:12px;color:#8d859e">
          Email tự động từ ${SITE}. Vui lòng không trả lời trực tiếp nếu không cần thiết.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function row(label: string, value: string) {
  return `<tr>
    <td style="padding:6px 0;color:#948ba6;font-size:13px;width:42%">${label}</td>
    <td style="padding:6px 0;color:#efeaf8;font-size:13px;font-weight:600;text-align:right">${value}</td>
  </tr>`;
}

function orderTable(order: Order) {
  const items = order.items?.length ? order.items : [];
  const combo = items.length > 1;
  const detail = combo
    ? `<div style="margin-top:8px;padding-top:8px;border-top:1px dashed #352b48">${items
        .map(
          (item) =>
            `<div style="padding:3px 0;font-size:13px;color:#d9d3e6">• ${escapeHtml(item.serviceName)} · ${escapeHtml(item.packageName)} — <b style="color:${ACCENT}">${formatVnd(item.price)}</b></div>`,
        )
        .join('')}</div>`
    : '';
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:14px 0 6px;border-top:1px solid #2b2436">
    ${row('Mã đơn', order.code)}
    ${combo ? row('Số gói', `${items.length} gói gộp`) : row('Dịch vụ', order.serviceName)}
    ${row('Gói', order.packageName)}
    ${row('Giá trị', formatVnd(order.price))}
    ${row('UID game', order.gameUid)}
    ${row('Máy chủ', order.gameServer)}
    ${row('Tên nhân vật', order.gameName || '—')}
    ${row('Thanh toán', order.paymentMethod === 'balance' ? 'Số dư ví' : 'Chuyển khoản')}
  </table>${detail}`;
}

function customerNoteBlock(note: string) {
  const content = note.trim()
    ? escapeHtml(note)
    : '<span style="color:#948ba6">Khách không để lại ghi chú.</span>';
  return `<div style="margin-top:12px;padding:12px 14px;background:#1f1930;border:1px solid #352b48;border-radius:12px">
    <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${ACCENT}">Ghi chú của khách</div>
    <div style="margin-top:6px;color:#d9d3e6;white-space:pre-wrap;overflow-wrap:anywhere">${content}</div>
  </div>`;
}

async function send(to: string, subject: string, html: string) {
  if (!mailConfigured()) {
    console.warn('[mail] Bỏ qua gửi email vì chưa cấu hình GMAIL_USER / GMAIL_APP_PASSWORD');
    return false;
  }
  try {
    await transport().sendMail({
      from: `"${SITE}" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('[mail] Gửi thất bại:', error);
    return false;
  }
}

function adminRecipient(): string {
  return process.env.MAIL_TO || process.env.GMAIL_USER || '';
}

export async function sendOrderEmails(order: Order) {
  const admin = adminRecipient();
  const combo = (order.items?.length || 0) > 1;
  const adminSubject = combo
    ? `[Đơn mới ${order.code}] Đơn gộp ${order.items.length} gói`
    : `[Đơn mới ${order.code}] ${order.serviceName} · ${order.packageName}`;
  if (admin) {
    const handover = await orderHandoverNote(order);
    await send(
      admin,
      adminSubject,
      shell(
        'Có đơn cày thuê mới',
        `<p>Một đơn hàng vừa được tạo trên ${SITE}.</p>
        ${orderTable(order)}
        ${customerNoteBlock(order.note)}
        ${handoverBlock(handover)}
        <p style="margin-top:16px;color:#a99fc0">Khách hàng: ${order.email}</p>
        <p style="margin-top:4px;color:#a99fc0">Mã đơn: <strong style="color:${ACCENT}">${order.code}</strong></p>`,
      ),
    );
  }
  await send(
    order.email,
    combo
      ? `Đã nhận đơn ${order.code} — ${order.items.length} gói gộp`
      : `Đã nhận đơn ${order.code} — ${order.packageName}`,
    shell(
      'Đơn của bạn đã được ghi nhận',
      `<p>Chào bạn, cảm ơn bạn đã tin tưởng ${SITE}.</p>
      ${orderTable(order)}
      <p style="margin-top:14px">Trạng thái hiện tại: <strong style="color:${ACCENT}">${statusLabel(order.status)}</strong>.</p>
      <p style="margin-top:10px;color:#a99fc0">Chúng tôi sẽ liên hệ qua email này khi đơn bắt đầu được xử lý. Bạn cũng có thể theo dõi trong mục “Lịch sử đặt hàng” trên website.</p>`,
    ),
  );
}

export async function sendTopupEmails(topup: Topup, approved: boolean) {
  const admin = adminRecipient();
  if (approved) {
    await send(
      topup.email,
      `Đã cộng ${formatVnd(topup.amount)} vào ví — ${topup.code}`,
      shell(
        'Nạp tiền thành công',
        `<p>Số dư ví của bạn đã được cập nhật.</p>
        <table role="presentation" width="100%" style="margin-top:12px">
          ${row('Mã giao dịch', topup.code)}
          ${row('Số tiền', formatVnd(topup.amount))}
          ${row('Phương thức', topup.method)}
        </table>
        <p style="margin-top:14px;color:#a99fc0">Bạn có thể dùng số dư này để thanh toán đơn cày thuê ngay lập tức.</p>`,
      ),
    );
    return;
  }
  if (admin) {
    await send(
      admin,
      `[Nạp tiền ${topup.code}] ${formatVnd(topup.amount)} · ${topup.email}`,
      shell(
        'Yêu cầu nạp tiền mới',
        `<p>Khách hàng vừa gửi yêu cầu nạp tiền, hãy kiểm tra sao kê và duyệt trong trang quản trị.</p>
        <table role="presentation" width="100%" style="margin-top:12px">
          ${row('Mã giao dịch', topup.code)}
          ${row('Khách hàng', topup.email)}
          ${row('Số tiền', formatVnd(topup.amount))}
          ${row('Phương thức', topup.method)}
        </table>
        ${topup.note ? `<p style="margin-top:12px"><strong>Ghi chú:</strong> ${escapeHtml(topup.note)}</p>` : ''}`,
      ),
    );
  }
}

export async function sendOtpEmail(email: string, code: string) {
  return send(
    email,
    `${code} là mã xác thực đặt lại mật khẩu ${SITE}`,
    shell(
      'Mã xác thực đặt lại mật khẩu',
      `<p>Xin chào,</p>
      <p>Mã OTP của bạn là:</p>
      <div style="margin:18px 0;padding:16px 0;text-align:center;background:#1f1930;border:1px solid #352b48;border-radius:14px;font-size:30px;letter-spacing:10px;font-weight:700;color:${ACCENT}">${code}</div>
      <p>Mã có hiệu lực trong <strong>10 phút</strong> và chỉ dùng được một lần.</p>
      <p style="color:#a99fc0">Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này — tài khoản của bạn vẫn an toàn.</p>`,
    ),
  );
}

function handoverBlock(note: string | null) {
  if (!note) return '';
  return `<div style="margin-top:14px;padding:12px 14px;background:#1f1930;border:1px solid #352b48;border-radius:12px">
    <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${ACCENT}">Gợi ý xử lý</div>
    <div style="margin-top:6px;color:#d9d3e6;white-space:pre-line">${escapeHtml(note)}</div>
  </div>`;
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    awaiting_payment: 'Chờ thanh toán',
    pending: 'Chờ nhận đơn',
    processing: 'Đang cày',
    completed: 'Hoàn thành',
    cancelled: 'Đã huỷ',
  };
  return map[status] || status;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
