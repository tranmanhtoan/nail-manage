# MCC Nail & Spa — Changelog

> Log ghi lại mỗi lần update/chỉnh sửa trong dự án.

---

## [2026-07-29]

### Thêm mới
- Tạo `docs/PROJECT_OVERVIEW.md` — Mô tả tổng quan kiến trúc và chức năng từng module trong dự án
- Tạo `docs/CHANGELOG.md` — File ghi log thay đổi
- Tạo hook tự động ghi log khi có file được lưu/tạo/xóa trong `src/`
- Tạo mới `src/components/ErrorBoundary.tsx` — React Error Boundary component để bắt lỗi runtime và hiển thị fallback UI
- Tạo mới `src/lib/validations.ts` — Zod validation schemas cho tất cả forms (QuickEntry, Appointment, Customer, Employee, Service, Booking, Login)
- Tạo mới `src/store/dataStore.ts` — Zustand data cache store với stale-while-revalidate pattern cho employees, services, customers

### Chỉnh sửa
- Chỉnh sửa `src/App.tsx` — Thêm React.lazy() code splitting theo role + Suspense + ErrorBoundary bọc routes
- Chỉnh sửa `src/store/syncStore.ts` — Thêm idempotency key để tránh duplicate khi submit offline nhiều lần
- Chỉnh sửa `src/lib/supabase.ts` — Thêm initAuthListener() xử lý token refresh và session expiry gracefully
- Chỉnh sửa `src/App.tsx` — Import initAuthListener để kích hoạt auth session monitoring
- Chỉnh sửa `src/index.css` — Thêm accessibility: focus-visible ring, skip-link, touch-target, prefers-reduced-motion, high-contrast text
- Chỉnh sửa `src/components/PinGate.tsx` — Thêm keyboard event handler cho phép nhập PIN bằng bàn phím vật lý
- Chỉnh sửa `src/components/BottomNav.tsx` — Thêm role="navigation" và aria-label cho nav element
- Chỉnh sửa `index.html` — Thêm skip-to-content link cho keyboard/screen reader users
- Chỉnh sửa `.gitignore` — Thêm `graphify-out/cost.json`
- Chỉnh sửa `package.json` — Cài thêm dependency `zod@3.23.8`
- Chỉnh sửa `src/lib/supabase.ts` — Skip initAuthListener trong UAT mode (tránh logout sai khi không có session thật)

### Tích hợp
- Cài Graphify knowledge graph (`graphify kiro install --project`) — 288 nodes, 445 edges, 17 communities
- Tạo `.kiro/skills/graphify/SKILL.md` và `.kiro/steering/graphify.md` cho always-on graph query

## [2026-07-30]

### Chỉnh sửa
- [10:30] Chỉnh sửa `src/pages/owner/Dashboard.tsx` — Thêm month picker popup (chọn tháng/năm) cho Performance card, nút Calendar giờ hoạt động
