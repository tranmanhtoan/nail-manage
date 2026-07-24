# MCC Nail & Spa — Giới thiệu ứng dụng

## Tổng quan

**MCC Nail & Spa** là ứng dụng quản lý tiệm nail dạng Progressive Web App (PWA), được thiết kế tối ưu cho thiết bị di động và tablet. Ứng dụng hỗ trợ toàn bộ quy trình vận hành hàng ngày của một tiệm nail — từ quản lý lịch hẹn, nhân viên, dịch vụ, đến theo dõi doanh thu và báo cáo.

Ứng dụng hỗ trợ song ngữ **Tiếng Việt** và **Tiếng Anh**.

---

## Tech Stack

| Thành phần | Công nghệ |
|---|---|
| Frontend | React 19, TypeScript |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 4 |
| Backend / Database | Supabase (PostgreSQL + Auth + RLS) |
| State Management | Zustand |
| Routing | React Router DOM 7 |
| Đa ngôn ngữ | i18next + react-i18next |
| Icons | Lucide React |
| PWA | vite-plugin-pwa (offline, installable) |
| Deploy | Vercel |

---

## Vai trò người dùng (Roles)

Ứng dụng phân quyền theo 3 vai trò chính:

### 1. Owner (Chủ tiệm)
- Toàn quyền quản lý tiệm
- Xem dashboard tổng quan doanh thu
- Quản lý lịch hẹn & vòng tua nhân viên
- Quản lý nhân viên (CRUD, tạo tài khoản, chọn hình thức trả lương)
- Quản lý dịch vụ (thêm/sửa/bật-tắt)
- Quản lý khách hàng
- Xem báo cáo & phân tích kinh doanh
- Cài đặt hệ thống (bật/tắt chức năng, PIN kiosk, Super Mode)

### 2. Employee (Nhân viên)
- Xem lịch làm việc cá nhân
- Nhập nhanh dịch vụ hoàn thành (Quick Entry)
- Check-in dịch vụ cho khách
- Xem thu nhập cá nhân (tự tính toán theo hình thức trả lương)

### 3. Kiosk (Chế độ tablet dùng chung)
- Truy cập qua mã PIN (không cần đăng nhập email)
- Nhập nhanh dịch vụ walk-in
- Cho phép nhân viên đăng nhập cá nhân từ tablet chung

---

## Các tính năng chính

### Dashboard (Owner)
- Doanh thu ngày (tổng, tiền mặt, tiền thẻ)
- So sánh tăng trưởng so với tuần trước
- Số khách đã phục vụ & đang chờ
- Trung bình chi tiêu mỗi khách
- Biểu đồ xu hướng tuần (bar chart)
- Hoạt động gần đây (lọc theo nhân viên)
- Điều hướng ngày (prev/next/today)

### Lịch hẹn & Vòng tua (Appointments)
- **Vòng tua nhân viên (Rotation):** hiển thị thứ tự phục vụ, cho phép kéo-thả (desktop) hoặc tap + mũi tên (mobile) để đổi thứ tự
- Hiển thị trạng thái rảnh/đang làm/kế tiếp + thời gian idle
- Lịch hẹn theo ngày với date strip tuần
- Lọc theo trạng thái: Chờ, Đang làm, Hoàn thành, Đã hủy
- Tạo/sửa lịch hẹn (chọn khách, dịch vụ, nhân viên, giờ)
- Quy trình trạng thái: Booked → In Progress → Completed / Cancelled
- **Super Mode:** cho phép chỉnh sửa giá, tip, trạng thái, nhân viên, dịch vụ, phương thức thanh toán trên mọi cuộc hẹn
- Đếm số lượt (turns) mỗi nhân viên trong ngày

### Nhập nhanh (Quick Entry)
- Chọn nhân viên (hiển thị thời gian idle)
- Chọn dịch vụ (giá tự điền)
- Nhập giá & tip
- Chọn phương thức thanh toán (cash/card)
- Bước xác nhận (review) trước khi lưu
- Khi đăng nhập với vai trò employee: tự chọn chính mình, không hiện danh sách NV

### Quản lý nhân viên
- CRUD nhân viên
- 3 hình thức trả lương:
  - **Commission:** hoa hồng % trên giá dịch vụ + toàn bộ tip
  - **Fixed:** lương cứng + tip (không tính commission)
  - **Split:** chia tổng (giá + tip) theo tỷ lệ (vd: 60/40)
- Tạo tài khoản đăng nhập tự động (username + password tạm)
- Tạo hàng loạt tài khoản cho nhân viên chưa có
- Bật/tắt trạng thái hoạt động

### Quản lý dịch vụ
- Thêm/sửa dịch vụ
- Phân loại: Manicure, Pedicure, Gel, Acrylic, Dip Powder, Waxing, Khác
- Thiết lập giá & thời gian
- Bật/tắt dịch vụ

### Quản lý khách hàng
- Thêm/sửa thông tin khách (tên, SĐT, email, ghi chú)
- Tìm kiếm theo tên/SĐT
- Tự động tạo khách mới khi đặt lịch online

### Báo cáo & Phân tích (Reports)
- Lọc theo Ngày / Tuần / Tháng
- Top nhân viên nổi bật (xếp hạng theo doanh thu)
- Doanh thu theo dịch vụ (bar chart)
- Click vào nhân viên → xem chi tiết từng cuộc hẹn
- In phiếu thanh toán (pay statement) cho nhân viên

### Đặt lịch online (Public Booking)
- Không cần đăng nhập
- Quy trình wizard: Chọn dịch vụ → Chọn ngày giờ → Nhập thông tin → Xác nhận
- Tự động tạo hoặc liên kết khách hàng theo SĐT
- Trạng thái mặc định: "Booked" + source "online"

### Chế độ Kiosk
- Bảo vệ bằng mã PIN (cấu hình từ Settings)
- Đăng nhập ẩn bằng tài khoản kiosk riêng
- 2 tab: Quick Entry + Cá nhân (đăng nhập nhân viên)

### Cài đặt (Settings)
- Chuyển đổi ngôn ngữ (EN/VI)
- Bật/tắt chức năng: Quick Entry, Appointments, Reports
- Cấu hình mã PIN kiosk
- Super Mode (chế độ quản trị nâng cao)
- Quản lý nhân viên & dịch vụ (trong cùng trang)

---

## Cơ sở dữ liệu (Database Schema)

| Bảng | Mô tả |
|---|---|
| `profiles` | Thông tin user liên kết Supabase Auth (id, email, full_name, role) |
| `employees` | Nhân viên (name, pay_type, commission_rate, rotation_order, activated_at) |
| `services` | Dịch vụ (name, category, price, duration_minutes) |
| `customers` | Khách hàng (name, phone, email, notes) |
| `appointments` | Cuộc hẹn/giao dịch (employee, service, customer, status, price, tip, payment_method, source) |
| `shop_settings` | Key-value store cho cấu hình (feature toggles, kiosk_pin) |

### Bảo mật (Row Level Security)
- **Owner:** toàn quyền trên mọi bảng
- **Employee:** chỉ đọc dịch vụ, đọc/tạo/sửa cuộc hẹn của mình, đọc khách hàng
- **Kiosk:** đọc nhân viên + dịch vụ active, tạo cuộc hẹn walk-in
- **Public (không đăng nhập):** đọc dịch vụ active, tạo cuộc hẹn online + tạo khách hàng

---

## Xác thực (Authentication)

- Dùng **Supabase Auth** (email/password)
- Hỗ trợ login bằng username đơn giản (tự thêm domain `@nail.local`)
- Màn hình đăng nhập dạng chọn avatar (không hiện email, bảo mật)
- RPC `get_login_email` để lookup email an toàn phía server
- Tự động tạo profile khi signup (trigger `handle_new_user`)

---

## PWA & Mobile

- **Installable:** có thể cài lên màn hình Home (iOS & Android)
- **Offline-capable:** Service Worker cache tài nguyên + Supabase API (NetworkFirst)
- **Mobile-first UI:** thiết kế responsive, bottom navigation, touch-friendly
- **Standalone mode:** chạy như app native (không address bar)

---

## Cấu trúc thư mục

```
src/
├── components/       # UI components dùng chung (Header, BottomNav, PinGate, LanguageSwitch)
├── i18n/             # Translations (en.json, vi.json)
├── lib/              # Supabase client, database types, auth helpers
├── pages/
│   ├── owner/        # Dashboard, Appointments, Services, Employees, Customers, Reports, Settings
│   ├── employee/     # MySchedule, MyEarnings, CheckIn
│   ├── booking/      # BookingPage (public)
│   └── kiosk/        # KioskLayout, KioskPersonal
├── store/            # Zustand stores (authStore, superModeStore)
├── App.tsx           # Routing & role-based layout
└── main.tsx          # Entry point
```

---

## Cách chạy

```bash
# Cài dependencies
npm install

# Chạy dev server
npm run dev

# Build production
npm run build

# Preview build
npm run preview
```

**Biến môi trường cần thiết** (file `.env`):
- `VITE_SUPABASE_URL` — URL project Supabase
- `VITE_SUPABASE_ANON_KEY` — Anon key Supabase
- `VITE_KIOSK_EMAIL` — Email tài khoản kiosk (optional)
- `VITE_KIOSK_PASSWORD` — Password tài khoản kiosk (optional)

---

## Triết lý thiết kế

- **Mobile-first:** UI tối ưu cho điện thoại & tablet, dùng hàng ngày tại quầy
- **Đơn giản & nhanh:** Quick Entry cho phép ghi nhận giao dịch trong vài giây
- **Role-based:** mỗi vai trò chỉ thấy đúng chức năng cần thiết
- **Glassmorphism UI:** card với background blur, border nhẹ, màu chủ đạo `#864e5a` (hồng đất)
- **Bilingual:** song ngữ Việt-Anh, chuyển đổi tức thì
