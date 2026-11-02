# Nhà Trọ Teyvat — website cày thuê Genshin Impact

Website đặt đơn cày thuê **La Hoàn Thâm Cảnh – Nhà Hát Kịch Ảo Tưởng – Ảo Cảnh Kỳ Bí**, giao diện tối
tím – hồng nhạt trên nền xám, có thể chỉnh sắc độ ngay trên header.

Toàn bộ dịch vụ dùng gói **miễn phí**: Firebase (Auth + Firestore) và Vercel (hosting), email gửi qua
**Gmail App Password**.

---

## 1. Tính năng

| Nhóm | Chi tiết |
| --- | --- |
| Đặt đơn | Chọn dịch vụ → chọn một hoặc nhiều gói (gộp combo La Hoàn + Ảo Cảnh + Nhà Hát) → nhập UID/máy chủ/ghi chú → thanh toán một lần cho cả đơn gộp |
| Email | Xác nhận đơn cho khách + thông báo đơn mới cho shop, gửi qua Gmail SMTP |
| Tài khoản | Đăng ký / đăng nhập bằng email, đăng nhập Google, quên mật khẩu bằng **OTP 6 số gửi vào Gmail** |
| Lịch sử | Lịch sử đặt hàng (lọc theo trạng thái) và lịch sử nạp tiền, số dư ví |
| Quản trị | `/admin`: duyệt/từ chối nạp tiền, đổi trạng thái đơn, xem doanh thu |
| Giao diện | Dark theme tím–hồng, hiệu ứng xuất hiện khi cuộn, chuyển động mượt, responsive, có nút chỉnh sắc độ |
| Demo | Chưa cấu hình Firebase vẫn chạy được đầy đủ bằng dữ liệu trong trình duyệt |

---

## 2. Yêu cầu

- **Node.js 22 trở lên** (Firebase Admin SDK v14 yêu cầu Node 22+). Máy đang dùng Node 26 là hợp lệ.
- Tài khoản Google (để tạo Firebase project và Gmail App Password).
- Tài khoản Vercel (miễn phí) khi muốn đưa lên mạng.

---

## 3. Chạy thử ngay (chế độ demo)

```bash
cd genshin-boost
npm install
npm run dev
```

Mở `http://localhost:3000`.

Khi **chưa điền** `NEXT_PUBLIC_FIREBASE_API_KEY`, website tự chạy ở **chế độ demo**:

- Dữ liệu (tài khoản, đơn, giao dịch) lưu trong `localStorage` của trình duyệt.
- Email/OTP không gửi thật, mã OTP hiện ngay trên màn hình.
- Tài khoản mẫu: **admin@demo.vn / 123456** (đã có đơn mẫu, có quyền quản trị).
- Email bắt đầu bằng `admin` sẽ có quyền vào `/admin`.
- Vào **Tài khoản → Cài đặt → Xoá dữ liệu demo** để đặt lại.

---

## 4. Cấu hình thật (Firebase + Gmail)

### 4.1. Tạo Firebase project

1. Vào <https://console.firebase.google.com> → **Add project** → đặt tên → tạo.
2. **Firestore Database** → *Create database* → chọn **Production mode** → region `asia-southeast1`
   (Singapore) cho gần Việt Nam.
3. **Authentication** → *Get started*:
   - Tab **Sign-in method** → bật **Email/Password**.
   - Bật **Google** → chọn support email.
4. **Project settings** (bánh răng) → **General** → mục *Your apps* → biểu tượng `</>` để thêm **Web app**.
   Sao chép 6 giá trị `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`.
5. Vẫn ở **Project settings** → tab **Service accounts** → *Generate new private key* → tải file JSON.
   Trong file đó lấy `project_id`, `client_email`, `private_key`.

> **Quan trọng:** `private_key` là chuỗi nhiều dòng. Khi dán vào `.env.local` hãy giữ nguyên các ký tự
> `\n` trong chuỗi và đặt trong dấu ngoặc kép (xem `.env.example`). Không đưa file JSON này lên git.

### 4.2. Tạo Gmail App Password

1. Bật **xác thực 2 bước** cho tài khoản Gmail: <https://myaccount.google.com/security>.
2. Vào <https://myaccount.google.com/apppasswords> → tạo mật khẩu ứng dụng (16 ký tự).
3. Dùng Gmail đó cho `GMAIL_USER` và mật khẩu 16 ký tự cho `GMAIL_APP_PASSWORD`.
4. `MAIL_TO` là email shop nhận thông báo đơn mới (có thể trùng `GMAIL_USER`).

### 4.3. Điền biến môi trường

```bash
cp .env.example .env.local
```

Mở `.env.local` và điền:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ten-du-an.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ten-du-an
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ten-du-an.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

FIREBASE_PROJECT_ID=ten-du-an
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@ten-du-an.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"

GMAIL_USER=shop@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
MAIL_TO=shop@gmail.com

ADMIN_EMAILS=shop@gmail.com
OTP_SECRET=mot-chuoi-ngau-nhien-that-dai

NEXT_PUBLIC_BANK_NAME=MB Bank
NEXT_PUBLIC_BANK_ACCOUNT=0123456789
NEXT_PUBLIC_BANK_OWNER=NGUYEN VAN A

# Tuỳ chọn: gợi ý xử lý đơn bằng AI qua Respan Gateway (xem mục 4.6)
RESPAN_API_KEY=
```

Khởi động lại `npm run dev`. Header sẽ hiện nút đăng nhập bình thường, không còn ghi “Chế độ demo”.

### 4.4. (Tuỳ chọn) Khoá Firestore

Trong Firebase Console → **Firestore Database** → tab **Rules**, dán nội dung file
[`firestore.rules`](firestore.rules) rồi **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if false; }
  }
}
```

Trình duyệt không truy cập Firestore trực tiếp — mọi thao tác đi qua API route dùng Admin SDK — nên
chặn toàn bộ là an toàn nhất.

### 4.5. Thêm tên miền cho đăng nhập Google

Firebase Console → **Authentication** → **Settings** → **Authorized domains**, thêm:

- `localhost` (có sẵn)
- tên miền Vercel của bạn, ví dụ `vong-nguyet.vercel.app`
- tên miền riêng nếu có

Thiếu bước này, đăng nhập Google sẽ báo lỗi `auth/unauthorized-domain`.

### 4.6. (Tuỳ chọn) Gợi ý xử lý đơn bằng Respan Gateway

Khi có `RESPAN_API_KEY`, mỗi email “đơn mới” gửi cho shop có thêm khối **Gợi ý xử lý**: 3–4 gạch đầu
dòng do model viết qua [Respan Gateway](https://www.respan.ai/docs/integrations/gateway/respan-api.md)
(`https://api.respan.ai/api/chat/completions`). Mọi request được Respan ghi log/trace, xem ở
**Observability → Logs** trên platform.

1. Tạo tài khoản và API key (chọn quyền **Gateway**) tại <https://platform.respan.ai>.
2. Điền `RESPAN_API_KEY` vào `.env.local` (server) và vào Environment Variables của Vercel.
3. Tuỳ chọn: đổi model bằng `RESPAN_MODEL` (mặc định `gpt-5.5`), hoặc đổi endpoint bằng
   `RESPAN_BASE_URL` nếu dùng Respan Enterprise.

Để trống key thì email vẫn gửi như cũ, chỉ không có phần gợi ý — website và đơn hàng không bị ảnh hưởng.
Respan tính phí theo lượt gọi; nếu hết credit thì phần gợi ý tự bỏ qua và có log `[respan]` ở server.

---

## 5. Đưa lên Vercel (miễn phí)

1. Đẩy thư mục dự án lên GitHub (repo riêng tư cũng được).
2. Vào <https://vercel.com/new> → **Import** repo.
3. Framework preset: **Next.js** — không cần đổi build command.
4. Mở **Environment Variables**, thêm **toàn bộ** biến trong `.env.local` (cả `NEXT_PUBLIC_*` lẫn
   biến bí mật) cho cả Production và Preview.
5. **Settings → General → Node.js Version**: chọn **22.x**.
6. Bấm **Deploy**. Sau khi có tên miền, quay lại bước **4.5** để thêm domain vào Firebase.
7. Mở `/admin` bằng email trong `ADMIN_EMAILS` để kiểm tra.

> Lưu ý: gói Vercel Hobby chỉ dành cho mục đích cá nhân/phi thương mại theo điều khoản của Vercel.
> Nếu chạy shop thật, cân nhắc nâng cấp gói Pro.

---

## 6. Hướng dẫn sử dụng

### Khách hàng

1. **Tạo tài khoản** bằng email (hoặc **Đăng nhập bằng Google**) tại `/dang-ky`.
2. **Nạp tiền** tại `/tai-khoan?tab=topup`:
   - Chọn mệnh giá hoặc nhập số tiền → bấm **Tạo lệnh nạp**.
   - Hệ thống sinh mã, ví dụ `NAP-YIRDZ`. Chuyển khoản đúng số tiền với **nội dung là mã đó**.
   - Quản trị viên duyệt → số dư được cộng, email xác nhận được gửi.
3. **Đặt đơn** tại `/dat-don`: chọn dịch vụ → chọn gói. Muốn gộp nhiều gói (ví dụ La Hoàn + Ảo Cảnh + Nhà Hát)
thì bấm vào từng gói để tích chọn — mỗi lần tích là thêm một dòng trong đơn, tất cả gộp thành **một đơn** với
một lần thanh toán (mã đơn gộp bắt đầu bằng `CB-`). Sau đó nhập UID (6–12 số) + máy chủ + ghi chú →
thanh toán bằng **số dư ví** (trừ ngay) hoặc **chuyển khoản** (chờ duyệt).
4. **Theo dõi** ở `/tai-khoan`: tab *Đơn hàng* (lọc theo trạng thái) và *Nạp tiền*.
5. **Quên mật khẩu**: `/quen-mat-khau` → nhập email → nhận OTP 6 số trong Gmail → đặt mật khẩu mới
   (OTP hết hạn sau 10 phút, tối đa 5 lần nhập sai, gửi lại sau 60 giây).

### Quản trị viên

1. Đăng nhập bằng email nằm trong `ADMIN_EMAILS` → vào `/admin`.
2. Tab **Nạp tiền**: đối chiếu sao kê → **Duyệt** (cộng số dư, gửi email cho khách) hoặc **Từ chối**.
3. Tab **Đơn hàng**: đổi trạng thái ngay trong bảng:
   `Chờ thanh toán → Chờ nhận đơn → Đang cày → Hoàn thành` (hoặc `Đã huỷ`).
4. Khách nhận email xác nhận khi đặt đơn; shop nhận email đơn mới tại `MAIL_TO`.

### Tuỳ chỉnh

- **Giá và gói dịch vụ**: sửa `lib/catalog.ts` (giá được server kiểm tra lại, không tin giá từ client).
- **Sắc độ giao diện**: nút hình tia ở header; mặc định 268° (tím), kéo về 300–330° để ngả hồng.
- **Nội dung trang chủ**: `app/page.tsx`; **màu sắc**: biến `--hue` trong `app/globals.css`.
- **Thông tin ngân hàng**: `NEXT_PUBLIC_BANK_*` (đổi xong phải build/deploy lại).

---

## 7. Cấu trúc thư mục

```
genshin-boost/
├─ app/
│  ├─ page.tsx                 Trang chủ (hero, dịch vụ, quy trình, bảng giá, FAQ)
│  ├─ dat-don/page.tsx         Trang đặt đơn
│  ├─ dang-nhap|dang-ky|quen-mat-khau/page.tsx
│  ├─ tai-khoan/page.tsx       Tổng quan, lịch sử đơn, nạp tiền, cài đặt
│  ├─ admin/page.tsx           Quản trị
│  ├─ api/
│  │  ├─ me/route.ts           Hồ sơ + số dư
│  │  ├─ orders/route.ts       Tạo / liệt kê đơn
│  │  ├─ topups/route.ts       Tạo / liệt kê nạp tiền
│  │  ├─ admin/route.ts        Duyệt nạp, đổi trạng thái đơn
│  │  └─ auth/otp/route.ts     Gửi OTP + đặt lại mật khẩu
│  ├─ layout.tsx · globals.css · icon.svg · not-found.tsx
├─ components/                 Header, Footer, OrderWizard, AccountDashboard, AdminDashboard…
├─ lib/
│  ├─ catalog.ts               Dịch vụ, gói giá, nhãn trạng thái, format tiền/ngày
│  ├─ types.ts                 Kiểu dữ liệu dùng chung
│  ├─ api.ts                   Lớp gọi API phía client (tự chuyển demo)
│  ├─ demo.ts                  Backend giả lập bằng localStorage
│  ├─ firebaseClient.ts        Firebase Web SDK
│  ├─ authErrors.ts            Dịch lỗi Firebase sang tiếng Việt
│  └─ server/
│     ├─ firebase.ts           Firebase Admin (service account)
│     ├─ http.ts               Xác thực token, phân quyền admin, chuẩn hoá lỗi
│     ├─ store.ts              Truy vấn Firestore: user, order, topup
│     ├─ mail.ts               Gmail SMTP + template email
│     └─ otp.ts                Sinh/băm OTP, đổi mật khẩu
├─ firestore.rules
├─ .env.example
└─ README.md
```

---

## 8. Dữ liệu lưu ở đâu

| Collection | Nội dung |
| --- | --- |
| `users/{uid}` | email, tên hiển thị, `balance`, ngày tạo |
| `orders/{id}` | mã đơn, uid, dịch vụ/gói, giá, UID game, máy chủ, ghi chú, phương thức thanh toán, trạng thái |
| `topups/{id}` | mã giao dịch, số tiền, trạng thái (`pending`/`approved`/`rejected`) |
| `otps/{uid}` | hash OTP, hạn dùng, số lần nhập sai (không lưu OTP dạng thô) |

Tài khoản đăng nhập do **Firebase Authentication** quản lý (email/password + Google). Website không bao
giờ lưu mật khẩu Genshin, chỉ lưu UID và thông tin khách tự nhập.

---

## 9. Bảo mật & lưu ý

- Mọi API đều xác thực Firebase ID token; API quản trị kiểm tra email trong `ADMIN_EMAILS`.
- Giá gói được tra lại từ `lib/catalog.ts` ở server — sửa giá trên trình duyệt không có tác dụng.
- Nạp tiền dùng transaction, chống duyệt trùng một giao dịch hai lần.
- `FIREBASE_PRIVATE_KEY`, `GMAIL_APP_PASSWORD`, `OTP_SECRET` chỉ nằm ở server (không có tiền tố
  `NEXT_PUBLIC_`), không lộ ra trình duyệt.
- Giới hạn miễn phí tham khảo: Firestore 1 GiB lưu trữ + 50k lượt đọc/ngày; Firebase Auth không giới hạn
  người dùng trên gói Spark; Gmail miễn phí ~500 người nhận/ngày (đủ cho shop nhỏ).
- `ADMIN_EMAILS` phải khớp chính xác email đăng nhập; đổi xong cần deploy lại (biến server).

---

## 10. Lỗi thường gặp

| Hiện tượng | Cách xử lý |
| --- | --- |
| `auth/unauthorized-domain` khi đăng nhập Google | Thêm domain vào Firebase → Authentication → Settings → Authorized domains |
| “Máy chủ chưa được cấu hình Firebase” | Chưa điền `FIREBASE_*` trong `.env.local`/Vercel, hoặc chưa restart/deploy lại |
| “Phiên đăng nhập đã hết hạn” | Token hết hạn hoặc sai cấu hình project; đăng nhập lại |
| Không nhận được email | Sai App Password (phải là 16 ký tự, không phải mật khẩu Gmail); kiểm tra hộp thư rác; xem log server |
| Nút duyệt nạp tiền báo lỗi | Email đăng nhập không nằm trong `ADMIN_EMAILS` |
| Số dư không đổi sau khi duyệt | Tải lại trang; kiểm tra transaction trong log Vercel |
| Trang trắng sau khi deploy | Thiếu `NEXT_PUBLIC_*` lúc build → thêm biến rồi **Redeploy** |
| Vercel báo lỗi Node | Settings → Node.js Version → 22.x rồi redeploy |

---

## 11. Lệnh thường dùng

```bash
npm run dev        # chạy development
npm run build      # build production
npm start          # chạy bản build
npm run typecheck  # kiểm tra TypeScript
```

Chúc shop của bạn đông khách 🌙
"# Nha-Tro-Teyvat" 
