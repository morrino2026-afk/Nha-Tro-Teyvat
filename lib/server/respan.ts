import type { Order } from '../types';

/**
 * Cầu nối tới Respan Gateway (OpenAI-compatible): mọi request đi qua
 * https://api.respan.ai/api đều được Respan ghi log/trace tự động.
 * Chỉ dùng ở server — RESPAN_API_KEY không có tiền tố NEXT_PUBLIC_.
 */
const DEFAULT_BASE_URL = 'https://api.respan.ai/api';
const DEFAULT_MODEL = 'gpt-5.5';
const TIMEOUT_MS = 12_000;

interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}

export function respanConfigured(): boolean {
  return Boolean(process.env.RESPAN_API_KEY);
}

function baseUrl(): string {
  return (process.env.RESPAN_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
}

function statusText(order: Order): string {
  const map: Record<string, string> = {
    awaiting_payment: 'chờ thanh toán',
    pending: 'chờ nhận đơn',
    processing: 'đang cày',
    completed: 'hoàn thành',
    cancelled: 'đã huỷ',
  };
  return map[order.status] || order.status;
}

async function chat(messages: ChatMessage[], maxTokens: number): Promise<string | null> {
  const key = process.env.RESPAN_API_KEY;
  if (!key) return null;

  try {
    const response = await fetch(`${baseUrl()}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: process.env.RESPAN_MODEL || DEFAULT_MODEL,
        messages,
        max_tokens: maxTokens,
        temperature: 0.3,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error(`[respan] Gateway trả về ${response.status}, bỏ qua gợi ý AI.`);
      return null;
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: unknown } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    return typeof content === 'string' && content.trim() ? content.trim() : null;
  } catch (error) {
    console.error('[respan] Không gọi được gateway:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Sinh gợi ý xử lý ngắn gọn cho shop trong email "đơn mới".
 * Trả về null khi chưa cấu hình key hoặc gateway lỗi — email vẫn gửi bình thường.
 */
export async function orderHandoverNote(order: Order): Promise<string | null> {
  if (!respanConfigured()) return null;

  return chat(
    [
      {
        role: 'system',
        content:
          'Bạn là trợ lý vận hành của shop cày thuê Genshin Impact (La Hoàn Thâm Cảnh, Nhà Hát Kịch Ảo Tưởng, Ảo Cảnh Kỳ Bí). ' +
          'Viết gợi ý xử lý cho nhân viên: tối đa 4 gạch đầu dòng, mỗi dòng dưới 20 từ, tiếng Việt, không dùng markdown, ' +
          'không chào hỏi, không nhắc lại toàn bộ thông tin đơn. Nêu việc cần làm và điểm cần lưu ý.',
      },
      {
        role: 'user',
        content: [
          `Mã đơn: ${order.code}`,
          `Dịch vụ: ${order.serviceName} — gói ${order.packageName}`,
          ...((order.items?.length || 0) > 1
            ? [
                `Đơn gộp ${order.items.length} gói trong một lần thanh toán:`,
                ...order.items.map(
                  (item) => `+ ${item.serviceName} · ${item.packageName} — ${item.price}đ`,
                ),
              ]
            : []),
          `Giá trị: ${order.price}đ`,
          `UID game: ${order.gameUid}`,
          `Máy chủ: ${order.gameServer}`,
          `Tên nhân vật: ${order.gameName || 'không cung cấp'}`,
          `Thanh toán: ${order.paymentMethod === 'balance' ? 'số dư ví (đã trừ)' : 'chuyển khoản (chưa xác nhận)'}`,
          `Trạng thái: ${statusText(order)}`,
          `Ghi chú của khách: ${order.note || 'không có'}`,
        ].join('\n'),
      },
    ],
    260,
  );
}
