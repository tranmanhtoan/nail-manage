# MCC Nail & Spa — Tổng quan Module

> Cập nhật lần cuối: 2026-07-29

---

## 1. `src/pages/owner/` — Module chủ tiệm (Owner)

Toàn bộ trang quản lý dành cho chủ tiệm:

| File | Chức năng |
|------|-----------|
| `Dashboard.tsx` | Trang tổng quan: doanh thu ngày, số khách, tăng trưởng, biểu đồ tuần, hoạt động gần đây |
| `Appointments.tsx` | Quản lý lịch hẹn + vòng tua nhân viên (rotation). Hỗ trợ kéo-thả, lọc trạng thái, tạo/sửa cuộc hẹn |
| `Employees.tsx` | CRUD nhân viên, 3 hình thức trả lương (commission/fixed/split), tạo tài khoản hàng loạt |
| `Services.tsx` | Quản lý dịch vụ (thêm/sửa/bật-tắt), phân loại theo nhóm |
| `Customers.tsx` | Quản lý khách hàng (thêm/sửa, tìm kiếm theo tên/SĐT) |
| `Reports.tsx` | Báo cáo doanh thu theo ngày/tuần/tháng, top nhân viên, biểu đồ dịch vụ, in phiếu lương |
| `Settings.tsx` | Cài đặt hệ thống: feature toggles, PIN kiosk, Super Mode, ngôn ngữ |
| `Admin.tsx` | Trang admin nâng cao (quản lý nhân viên, dịch vụ, khách hàng tập trung) |
| `admin/` (subfolder) | Các sub-page admin chi tiết (AdminEmployees, AdminServices, AdminCustomers, AdminSettings) |

---

## 2. `src/pages/employee/` — Module nhân viên (Employee)

Giao diện cho nhân viên khi đăng nhập trên tablet chung:

| File | Chức năng |
|------|-----------|
| `MySchedule.tsx` | Xem lịch làm việc cá nhân trong ngày |
| `MyEarnings.tsx` | Xem thu nhập (tự tính theo hình thức trả lương của mình) |
| `CheckIn.tsx` | Check-in dịch vụ cho khách đang chờ |

---

## 3. `src/pages/kiosk/` — Module Kiosk (Tablet dùng chung)

Chế độ tablet đặt tại quầy, bảo vệ bằng mã PIN:

| File | Chức năng |
|------|-----------|
| `KioskLayout.tsx` | Layout chứa 2 tab: Quick Entry (nhập nhanh walk-in) và Personal (đăng nhập cá nhân) |
| `KioskPersonal.tsx` | Cho phép nhân viên đăng nhập từ tablet dùng chung để vào giao diện cá nhân |

---

## 4. `src/pages/booking/` — Module đặt lịch online (Public)

| File | Chức năng |
|------|-----------|
| `BookingPage.tsx` | Wizard đặt lịch công khai (không cần đăng nhập): Chọn dịch vụ → Ngày giờ → Thông tin → Xác nhận |

---

## 5. `src/pages/QuickEntry.tsx` — Nhập nhanh (Shared)

Trang nhập nhanh dịch vụ hoàn thành, dùng chung cho cả Owner, Employee và Kiosk.

Quy trình: Chọn nhân viên → Chọn dịch vụ → Nhập giá/tip → Phương thức thanh toán → Xác nhận.

---

## 6. `src/pages/Login.tsx` — Đăng nhập

Màn hình đăng nhập dạng chọn avatar nhân viên (không hiện email để bảo mật). Hỗ trợ đăng nhập bằng username đơn giản.

---

## 7. `src/store/` — State Management (Zustand)

| File | Chức năng |
|------|-----------|
| `authStore.ts` | Xác thực: login/logout, kiểm tra session, hỗ trợ UAT mode (skip Supabase Auth khi dev) |
| `syncStore.ts` | Offline sync queue: lưu trữ actions khi mất mạng, tự đồng bộ khi online, retry/failed handling |
| `themeStore.ts` | Dark mode toggle, persist vào localStorage |
| `superModeStore.ts` | Bật/tắt Super Mode (chế độ chỉnh sửa nâng cao cho owner) |

---

## 8. `src/components/` — Components dùng chung

| File | Chức năng |
|------|-----------|
| `Header.tsx` | Thanh header: tên app, badge user (employee), trạng thái offline/syncing, nút settings/logout |
| `BottomNav.tsx` | Thanh điều hướng: bottom tab (mobile) + sidebar (desktop), khác nhau theo role |
| `EmployeeLayout.tsx` | Layout cho employee: tích hợp inactivity timeout, floating back/home, routing con |
| `PinGate.tsx` | Cổng PIN cho kiosk: nhập mã 4 số, auto-login tài khoản kiosk khi đúng |
| `FloatingBackHome.tsx` | Nút nổi kiểu iPhone: Back/Home, mờ khi không dùng, sáng khi chạm |
| `LanguageSwitch.tsx` | Nút chuyển ngôn ngữ EN ↔ VI |
| `OfflineSyncBanner.tsx` | Banner hiển thị trạng thái offline/pending/failed/synced thành công |

---

## 9. `src/lib/` — Thư viện & Utilities

| File | Chức năng |
|------|-----------|
| `supabase.ts` | Khởi tạo Supabase client (chính + admin riêng cho tạo user mới) |
| `database.types.ts` | TypeScript types cho data model: Employee, Service, Customer, Appointment, PayType, UserRole |
| `auth-helpers.ts` | Chuyển đổi username ↔ email (thêm/bỏ `@nail.local`) để Supabase Auth chấp nhận |

---

## 10. `src/hooks/` — Custom Hooks

| File | Chức năng |
|------|-----------|
| `useInactivityTimeout.ts` | Auto-logout sau 2 phút không tương tác (touch/click/key/scroll). Redirect về kiosk khi hết hạn |

---

## 11. `src/i18n/` — Đa ngôn ngữ (i18next)

| File | Chức năng |
|------|-----------|
| `index.ts` | Khởi tạo i18next với fallback EN, đọc ngôn ngữ đã chọn từ localStorage |
| `en.json` | Bản dịch tiếng Anh |
| `vi.json` | Bản dịch tiếng Việt |

---

## 12. Hạ tầng & Cấu hình

| File | Chức năng |
|------|-----------|
| `App.tsx` | Routing chính, phân luồng theo role (owner/employee/kiosk/public) |
| `main.tsx` | Entry point: render React app với BrowserRouter |
| `index.html` | HTML shell cho PWA (manifest, meta tags) |
| `package.json` | Dependencies: React 19, Vite 8, Tailwind 4, Supabase, Zustand, i18next, vite-plugin-pwa |
| `.env` | Biến môi trường (Supabase URL/Key, Kiosk credentials, UAT mode) |

---

## Kiến trúc tổng thể

```
Kiến trúc role-based:
┌─────────────────────────────────────────────────────┐
│                    App.tsx (Router)                   │
├──────────┬──────────┬──────────┬───────────────────────┤
│  Owner   │ Employee │  Kiosk   │  Public (Booking)   │
│  Layout  │  Layout  │ PinGate  │  No Auth Required   │
├──────────┴──────────┴──────────┴───────────────────────┤
│              Shared Components & Stores               │
├──────────────────────────────────────────────────────┤
│         Supabase (Auth + DB + RLS + Realtime)        │
└──────────────────────────────────────────────────────┘
```

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
