import type { OrderItem } from './types';

export interface ServicePackage {
  id: string;
  name: string;
  desc: string;
  price: number;
  duration: string;
  popular?: boolean;
  perks: string[];
}

export interface ServiceCategory {
  id: 'abyss' | 'theater' | 'vision';
  name: string;
  shortName: string;
  tagline: string;
  desc: string;
  accent: string;
  icon: 'abyss' | 'theater' | 'vision';
  packages: ServicePackage[];
}

export const SERVICES: ServiceCategory[] = [
  {
    id: 'abyss',
    name: 'La Hoàn Thâm Cảnh',
    shortName: 'La Hoàn',
    tagline: 'Chinh phục 36 sao',
    desc: 'Đội hình của bạn sẽ được tối ưu để vượt từng tầng trong thời gian ngắn nhất, không đổi mật khẩu, không động vào tài nguyên quý.',
    accent: 'abyss',
    icon: 'abyss',
    packages: [
      {
        id: 'abyss-9-10',
        name: 'Tầng 9 – 10 · 18★',
        desc: 'Trọn 2 tầng đầu của La Hoàn, phù hợp tài khoản mới lên AR45.',
        price: 20000,
        duration: '~45 phút',
        perks: ['Báo cáo chi tiết từng tầng'],
      },
      {
        id: 'abyss-11',
        name: 'Tầng 11 · 9★',
        desc: 'Vượt tầng 11 với đội hình tối ưu, xử lý mọi cơ chế khắc chế nguyên tố.',
        price: 30000,
        duration: '~1 giờ',
        perks: ['Báo cáo chi tiết từng tầng'],
      },
      {
        id: 'abyss-12',
        name: 'Tầng 12 · 9★',
        desc: 'Thử thách khó nhất của La Hoàn — được xử lý bởi đội ngũ rank cao.',
        price: 42000,
        duration: '~1.5 giờ',
        popular: true,
        perks: ['Báo cáo chi tiết từng tầng'],
      },
      {
        id: 'abyss-full',
        name: 'Full 36★ · Tầng 9 – 12',
        desc: 'Gói tiết kiệm nhất cho toàn bộ La Hoàn trong một chu kỳ.',
        price: 70000,
        duration: '~2.5 giờ',
        perks: ['Báo cáo chi tiết từng tầng'],
      },
    ],
  },
  {
    id: 'theater',
    name: 'Nhà Hát Kịch Ảo Tưởng',
    shortName: 'Nhà Hát',
    tagline: 'Vượt mọi màn diễn',
    desc: 'Mở khoá toàn bộ phần thưởng Nhà Hát với đội hình đa dạng nguyên tố, kể cả các màn yêu cầu nhân vật đặc biệt.',
    accent: 'theater',
    icon: 'theater',
    packages: [
      {
        id: 'theater-1-4',
        name: 'Màn 1 – 4',
        desc: 'Hoàn thành nửa đầu Nhà Hát, nhận trọn mốc thưởng đầu tiên.',
        price: 12000,
        duration: '~1 giờ',
        perks: ['Báo cáo chi tiết từng tầng'],
      },
      {
        id: 'theater-5-8',
        name: 'Màn 5 - 8',
        desc: 'Các màn còn lại với cơ chế nguyên tố khó, cần đội hình dự phòng.',
        price: 26000,
        duration: '~1.5 giờ',
        perks: ['Báo cáo chi tiết từng tầng'],
      },
      {
        id: 'theater-full',
        name: 'Full 10 màn',
        desc: 'Hoàn thành 10 màn, yêu cầu đội hình đa dạng nguyên tố và nhân vật hỗ trợ.',
        price: 40000,
        popular: true,
        duration: '~2.5 giờ',
        perks: ['Báo cáo chi tiết từng tầng'],
      },
      {
        id: 'theater-full-12',
        name: 'Full 12 màn + Thánh Bài',
        desc: 'Hoàn thành hết 12 màn với Thánh Bài, yêu cầu đội hình đa dạng và build tốt',
        price: 52000,
        duration: '~2.5 giờ',
        perks: ['Báo cáo chi tiết từng tầng'],
      },
    ],
  },
  {
    id: 'vision',
    name: 'Ảo Cảnh Kỳ Bí',
    shortName: 'Ảo Cảnh',
    tagline: 'Phá đảo giới hạn',
    desc: 'Chế độ thử thách giới hạn theo mùa — nơi đội hình, nguyên tố và kỹ năng đều bị thử thách. Thợ của chúng tôi đã quen với mọi mùa.',
    accent: 'vision',
    icon: 'vision',
    packages: [
      {
        id: 'vision-normal',
        name: 'Ảo Cảnh · III',
        desc: 'Ảo cảnh III có ít nhất 1 DPS đã build tốt',
        price: 15000,
        duration: '~1 giờ',
        perks: ['Báo cáo chi tiết từng tầng'],
      },
      {
        id: 'vision-hard',
        name: 'Ảo Cảnh · IV',
        desc: 'Cần nhiều team đã build, DPS chính đã build tốt, có thể cần 1-2 nhân vật hỗ trợ. Cần xem xét đủ điều kiện qua được không.',
        price: 22000,
        duration: '~2 giờ',
        popular: true,
        perks: ['Báo cáo chi tiết từng tầng'],
      },
      {
        id: 'vision-difficult',
        name: 'Ảo Cảnh · V',
        desc: 'Cần đội hình đa dạng, DPS tốt với sp đi kèm theo DPS đó. Cần xem xét đủ điều kiện qua được không.',
        price: 36000,
        duration: '~3 giờ',
        perks: ['Báo cáo chi tiết từng tầng'],
      },
      {
        id: 'vision-extreme',
        name: 'Ảo Cảnh · VI',
        desc: 'DPS khắc chế 3 phòng, team build tốt. Cần xem xét đủ điều kiện qua được không.',
        price: 50000,
        duration: '~3 giờ',
        perks: ['Báo cáo chi tiết từng tầng'],
      },
    ],
  },
];

export const ORDER_STATUS: Record<string, { label: string; tone: string }> = {
  awaiting_payment: { label: 'Chờ thanh toán', tone: 'warn' },
  pending: { label: 'Chờ nhận đơn', tone: 'info' },
  processing: { label: 'Đang cày', tone: 'accent' },
  completed: { label: 'Hoàn thành', tone: 'success' },
  cancelled: { label: 'Đã huỷ', tone: 'danger' },
};

export const TOPUP_STATUS: Record<string, { label: string; tone: string }> = {
  pending: { label: 'Chờ duyệt', tone: 'warn' },
  approved: { label: 'Đã cộng', tone: 'success' },
  rejected: { label: 'Từ chối', tone: 'danger' },
};

export const GAME_SERVERS = ['Asia', 'America', 'Europe', 'TW / HK / MO'];

export function formatVnd(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function findPackage(serviceId: string, packageId: string) {
  const service = SERVICES.find((s) => s.id === serviceId);
  const pkg = service?.packages.find((p) => p.id === packageId);
  return { service, pkg };
}

/**
 * Chấp nhận đơn nhiều gói (`items`) hoặc payload một gói cũ (serviceId + packageId).
 * Giá luôn được tra lại từ catalog — không tin giá từ client. Trả về lỗi thay vì throw
 * để route chuyển thành AppError 400.
 */
export function resolveOrderItems(payload: {
  items?: unknown;
  serviceId?: unknown;
  packageId?: unknown;
}): { items: OrderItem[]; error: string | null } {
  const raw: unknown[] = Array.isArray(payload.items) && payload.items.length
    ? payload.items
    : [payload];

  if (raw.length > 8) {
    return { items: [], error: 'Một đơn tối đa 8 gói. Vui lòng tách thành nhiều đơn.' };
  }

  const seen = new Set<string>();
  const items: OrderItem[] = [];

  for (const entry of raw) {
    const item = (entry || {}) as { serviceId?: unknown; packageId?: unknown };
    const service = SERVICES.find((s) => s.id === item.serviceId);
    if (!service) return { items: [], error: 'Dịch vụ không hợp lệ.' };
    const pkg = service.packages.find((p) => p.id === item.packageId);
    if (!pkg) return { items: [], error: 'Gói dịch vụ không hợp lệ.' };
    const key = `${service.id}:${pkg.id}`;
    if (seen.has(key)) return { items: [], error: 'Không chọn trùng gói trong một đơn.' };
    seen.add(key);
    items.push({
      serviceId: service.id,
      serviceName: service.name,
      packageId: pkg.id,
      packageName: pkg.name,
      price: pkg.price,
    });
  }

  return { items, error: null };
}
