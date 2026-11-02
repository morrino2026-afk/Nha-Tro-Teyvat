import Link from 'next/link';
import { Reveal } from '@/components/Reveal';
import {
  IconAbyss,
  IconArrow,
  IconCheck,
  IconClock,
  IconShield,
  IconSpark,
  IconTheater,
  IconVision,
} from '@/components/Icons';
import { SERVICES, formatVnd } from '@/lib/catalog';

function ServiceIcon({ icon }: { icon: 'abyss' | 'theater' | 'vision' }) {
  if (icon === 'abyss') return <IconAbyss width={24} height={24} />;
  if (icon === 'theater') return <IconTheater width={24} height={24} />;
  return <IconVision width={24} height={24} />;
}

const STEPS = [
  {
    title: 'Chọn gói phù hợp',
    desc: 'La Hoàn, Nhà Hát hay Ảo Cảnh mỗi gói đã ghi rõ mốc hoàn thành, thời gian và giá. Không phí ẩn.',
  },
  {
    title: 'Gửi UID & thanh toán',
    desc: 'Điền UID, máy chủ và tên nhân vật. Thanh toán bằng số dư ví hoặc chuyển khoản, đơn được ghi nhận ngay.',
  },
  {
    title: 'Theo dõi & nhận báo cáo',
    desc: 'Trạng thái đơn cập nhật theo thời gian thực. Khi xong, bạn nhận email kèm ảnh chụp kết quả từng tầng.',
  },
];

const QUOTES = [
  {
    name: 'Morri',
    role: 'Dev',
    text: 'Cam kết giúp bạn hoàn thành Ảo Cảnh, La Hoàn hay Nhà Hát 100% Chúng tôi đặt trải nghiệm của khách hàng là lên hàng đầu!',
  },
  {
    name: 'Alice',
    role: 'Support',
    text: 'Xin được phục vụ quý khách, chúng tôi mong bạn có một trải nghiệm thật tốt!',
  },
  {
    name: 'Random Guy',
    role: 'Support',
    text: 'Đội ngũ nhiệt tình và thời gian trả lời cực nhanh.',
  },
];

const FAQ = [
  {
    q: 'Cày thuê có làm mất tài khoản không?',
    a: 'Chúng tôi không bao giờ đổi mật khẩu hay email. Bạn có thể đổi mật khẩu ngay sau khi đơn hoàn thành. Mọi thao tác đều được ghi lại và báo cáo bằng ảnh chụp.',
  },
  {
    q: 'Đơn của tôi mất bao lâu?',
    a: 'La Hoàn tầng 12 thường 1 – 2 giờ, full 36★ khoảng 2 – 3 giờ. Nhà Hát và Ảo Cảnh có thể lâu hơn vào ngày cao điểm. Thời gian dự kiến được ghi trên từng gói.',
  },
  {
    q: 'Thanh toán bằng cách nào?',
    a: 'Bạn có thể nạp tiền vào ví nội bộ bằng chuyển khoản ngân hàng (quản trị viên duyệt trong vài phút), sau đó dùng số dư để đặt đơn. Ngoài ra có thể chọn chuyển khoản trực tiếp khi đặt.',
  },
  {
    q: 'Không đạt mốc cam kết thì sao?',
    a: 'Bạn được hoàn 100% số tiền của gói chưa hoàn thành, cộng thêm 10% vào ví cho lần đặt sau. Chính sách này áp dụng cho mọi gói La Hoàn và Nhà Hát.',
  },
  {
    q: 'Tôi có thể yêu cầu đội hình cụ thể không?',
    a: 'Có. Hãy ghi vào phần ghi chú khi đặt đơn, ví dụ “ưu tiên Raiden – Nahida”. Thợ sẽ cố gắng tối đa trong giới hạn nhân vật bạn có.',
  },
];

export default function HomePage() {
  const cheapest = Math.min(...SERVICES.flatMap((service) => service.packages.map((pkg) => pkg.price)));

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <Reveal>
              <span className="hero-badge">
                <span className="hero-badge__dot">
                  <IconSpark width={13} height={13} />
                </span>
                <b>Đang mở slot</b>
              </span>
            </Reveal>
            <Reveal delay={70}>
              <h1>
                <span className="hero-title__line">Chạm mốc cuối cùng</span>
                <span className="hero-title__line gradient-text">của Genshin, nhẹ như mơ.</span>
              </h1>
            </Reveal>
            <Reveal delay={140}>
              <p className="lead">
                La Hoàn 36★, Nhà Hát full màn, Ảo Cảnh phá đảo, đội ngũ pro player xử lý gọn trong vài giờ.
                Không đổi mật khẩu, không tiêu Nguyên Thạch, báo cáo minh bạch từng tầng.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <div className="hero-actions">
                <Link href="/dat-don" className="btn btn--primary btn--lg">
                  Đặt đơn ngay
                  <IconArrow width={18} height={18} />
                </Link>
                <Link href="#bang-gia" className="btn btn--ghost btn--lg">
                  Xem bảng giá
                </Link>
              </div>
              <p className="hero-note">
                <IconShield width={15} height={15} />
                Hoàn tiền 100% nếu không đạt mốc · Hỗ trợ 8:00 – 23:00
              </p>
            </Reveal>
            <Reveal delay={260}>
              <div className="hero-stats">
                <div className="stat">
                  <strong>2.400+</strong>
                  <span>Đơn đã hoàn thành</span>
                </div>
                <div className="stat">
                  <strong>4.9/5</strong>
                  <span>Từ 860 đánh giá</span>
                </div>
                <div className="stat">
                  <strong>&lt; 3h</strong>
                  <span>Thời gian xử lý trung bình</span>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={180} className="hero-visual">
            <span className="orbit" aria-hidden />
            <span className="orbit orbit--inner" aria-hidden />
            <div className="hero-card">
              <div className="hero-card__head">
                <span className="hero-card__badge">Meta Hiện tại</span>
                <IconAbyss width={22} height={22} style={{ color: 'var(--accent)' }} />
              </div>
              <div className="hero-card__title">Dựa vào build-team-damage</div>
              <div className="hero-card__sub">Đánh giá từ pro player</div>
              <div className="hero-card__stars">
                {Array.from({ length: 9 }).map((_, index) => (
                  <span key={index} className="star">
                    ★
                  </span>
                ))}
              </div>
              <div className="hero-card__rows">
                <div className="hero-card__row">
                  <span>Nhân vật</span>
                  <b>Odette / Skirk / Mavuika</b>
                </div>
                <div className="hero-card__row">
                  <span>Damage thuần F2P</span>
                  <b>6M - 8M tùy build</b>
                </div>
                <div className="hero-card__row">
                  <span>Server</span>
                  <b>Asia (~80ms) TW/HK/MO (~90ms) EU (~220ms) NA (~300ms)</b>
                </div>
              </div>
              <div className="hero-card__progress">
                <i />
              </div>
              <div className="hero-card__foot">
                <span>Rating damage</span>
                <span>7/10 (F2P)</span>
              </div>
            </div>
            <div className="floating-chip floating-chip--a">
              <IconCheck width={15} height={15} /> Phù hợp cho F2P
            </div>
            <div className="floating-chip floating-chip--b">
              <IconClock width={15} height={15} /> Dữ liệu từ 1 tháng trước
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section" id="dich-vu">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">Dịch vụ</span>
            <h2>Ba thử thách, một chỗ đặt</h2>
            <p className="lead">
              Mỗi chế độ đều có thợ chuyên trách riêng. Bạn chọn mốc cần đạt, phần còn lại để chúng tôi lo.
            </p>
          </Reveal>

          <div className="services-grid">
            {SERVICES.map((service, index) => (
              <Reveal key={service.id} delay={index * 90} as="article" className="card service-card">
                <div className="service-card__icon">
                  <ServiceIcon icon={service.icon} />
                </div>
                <span className="service-card__tag">{service.tagline}</span>
                <h3>{service.name}</h3>
                <p>{service.desc}</p>
                <ul className="service-card__list">
                  {service.packages[Math.min(service.packages.length - 1, 1)].perks.map((perk) => (
                    <li key={perk}>
                      <IconCheck width={14} height={14} />
                      {perk}
                    </li>
                  ))}
                </ul>
                <div className="service-card__foot">
                  <div className="service-card__from">
                    Từ
                    <strong>{formatVnd(Math.min(...service.packages.map((pkg) => pkg.price)))}</strong>
                  </div>
                  <Link href="/dat-don" className="service-card__link">
                    Đặt gói <IconArrow width={15} height={15} />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tight" id="quy-trinh">
        <div className="container">
          <Reveal className="section-head section-head--center">
            <span className="eyebrow">Quy trình</span>
            <h2>Ba bước, không rắc rối</h2>
            <p className="lead" style={{ marginInline: 'auto' }}>
              Từ lúc chọn gói đến khi nhận báo cáo, mọi thứ đều nằm trong trang tài khoản của bạn.
            </p>
          </Reveal>
          <div className="steps-grid">
            {STEPS.map((step, index) => (
              <Reveal key={step.title} delay={index * 90} className="card step">
                <span className="step__num">{String(index + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="bang-gia">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">Bảng giá</span>
            <h2>Minh bạch từng mốc</h2>
            <p className="lead">
              Giá đã bao gồm toàn bộ chi phí. Bắt đầu chỉ với {formatVnd(cheapest)} — đặt xong là có mã đơn ngay.
            </p>
          </Reveal>

          <div className="pricing-groups">
            {SERVICES.map((service, index) => (
              <Reveal key={service.id} delay={index * 70} className="pricing-group">
                <div className="pricing-group__head">
                  <span className="pricing-group__icon">
                    <ServiceIcon icon={service.icon} />
                  </span>
                  <div>
                    <h3>{service.name}</h3>
                    <span>{service.tagline}</span>
                  </div>
                </div>
                <div className="price-list">
                  {service.packages.map((pkg) => (
                    <div key={pkg.id} className="price-row">
                      <div>
                        <div className="price-row__name">
                          {pkg.name} {pkg.popular && <span className="tag">Phổ biến</span>}
                        </div>
                        <div className="price-row__desc">{pkg.desc}</div>
                      </div>
                      <div className="price-row__meta">
                        <IconClock width={14} height={14} /> {pkg.duration}
                      </div>
                      <div className="price-row__price">{formatVnd(pkg.price)}</div>
                      <Link href="/dat-don" className="price-row__cta">
                        Đặt <IconArrow width={13} height={13} />
                      </Link>
                    </div>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <Reveal className="section-head section-head--center">
            <span className="eyebrow">Cam kết</span>
            <h2>Những nhân viên sẽ đảm bảo việc gì?</h2>
          </Reveal>
          <div className="quotes-grid">
            {QUOTES.map((quote, index) => (
              <Reveal key={quote.name} delay={index * 80} className="card quote">
                <div className="quote__stars" aria-label="5 trên 5 sao">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <IconSpark key={starIndex} width={13} height={13} />
                  ))}
                </div>
                <p>“{quote.text}”</p>
                <div className="quote__author">
                  <span className="quote__avatar">{quote.name.charAt(0)}</span>
                  <div>
                    <strong>{quote.name}</strong>
                    <span>{quote.role}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="container" style={{ maxWidth: 820 }}>
          <Reveal className="section-head section-head--center">
            <span className="eyebrow">Hỏi đáp</span>
            <h2>Những điều bạn thường hỏi</h2>
          </Reveal>
          <div className="faq-list">
            {FAQ.map((item, index) => (
              <Reveal key={item.q} delay={index * 50}>
                <details className="faq-item">
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <Reveal className="cta-band">
            <div>
              <h2>Sẵn sàng nhận trọn mùa thưởng?</h2>
              <p>
                Tạo tài khoản bằng email hoặc Google, nạp ví và đặt đơn đầu tiên trong chưa đầy 2 phút. Đơn
                của bạn sẽ được xác nhận qua email.
              </p>
            </div>
            <div className="row">
              <Link href="/dat-don" className="btn btn--primary btn--lg">
                Đặt đơn ngay <IconArrow width={18} height={18} />
              </Link>
              <Link href="/dang-ky" className="btn btn--ghost btn--lg">
                Tạo tài khoản
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
