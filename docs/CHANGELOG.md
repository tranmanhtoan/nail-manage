# MCC Nail & Spa — Changelog

> Log ghi lại mỗi lần update/chỉnh sửa trong dự án.

---

## [2026-08-04]

### Chỉnh sửa
- [00:00] Chỉnh sửa `src/store/authStore.ts` — Fix logout không hoạt động: set user=null TRƯỚC khi gọi signOut() để UI phản hồi ngay lập tức, tránh race condition với onAuthStateChange
- [00:00] Chỉnh sửa `src/lib/supabase.ts` — Lưu subscription từ onAuthStateChange và unsubscribe trong stopAuthListener() để tránh listener zombie gọi logout lặp lại
- [00:00] Chỉnh sửa `src/lib/supabase.ts` — Thêm unsubscribe authSubscription vào stopAuthListener() để cleanup hoàn toàn khi logout
- [00:00] Chỉnh sửa `src/components/Header.tsx` — Thêm useNavigate và navigate('/') sau logout để đảm bảo chuyển về trang login
- [00:00] Chỉnh sửa `src/pages/owner/Settings.tsx` — Thêm useNavigate và handleLogout với navigate('/') cho nút logout trong Settings
- [00:00] Chỉnh sửa `src/components/Header.tsx` — Đổi sang window.location.href='/' thay vì React Router navigate để đảm bảo logout luôn reload trang

---

## [2026-08-03]

### Chỉnh sửa
- [15:53] Chỉnh sửa `src/i18n/index.ts` — Chuyển sang lazy-load translations theo ngôn ngữ đang dùng (dynamic import) thay vì bundle cả en+vi upfront, giảm initial bundle size
- [15:54] Chỉnh sửa `src/store/dataStore.ts` — Thay select('*') bằng explicit column list trong fetchEmployees để giảm payload từ Supabase
- [15:54] Chỉnh sửa `src/store/dataStore.ts` — Thay select('*') bằng explicit column list trong fetchServices để giảm payload
- [15:54] Chỉnh sửa `src/store/dataStore.ts` — Thay select('*') bằng explicit column list trong fetchCustomers để giảm payload
- [15:55] Chỉnh sửa `src/i18n/index.ts` — Fix TS error: đổi return type loadTranslation sang Record<string, unknown> cho nested JSON

---

## [2026-07-31]

### Chỉnh sửa
- [00:00] Chỉnh sửa `src/i18n/index.ts` — Wrap localStorage.getItem trong try-catch để tránh crash trên iOS Safari Private Browsing
- [00:00] Chỉnh sửa `src/store/superModeStore.ts` — Wrap localStorage access trong try-catch để tránh crash trên iOS Safari Private Browsing
- [00:00] Chỉnh sửa `src/App.tsx` — Thêm lazyRetry mechanism cho dynamic imports, tự retry khi chunk load fail trên mạng yếu/iOS
- [00:00] Chỉnh sửa `src/store/authStore.ts` — Thêm timeout 5s cho checkSession, wrap localStorage/sessionStorage trong try-catch để tránh stuck loading trên iOS
- [00:00] Chỉnh sửa `src/index.css` — Cải thiện safe-area-inset CSS cho notch devices, thêm overscroll-behavior và padding cho body/root
- [00:00] Chỉnh sửa `src/main.tsx` — Thêm SW update detection handler để force reload khi có version mới, fix iOS cache stuck
- [00:00] Chỉnh sửa `src/App.tsx` — Fix unused variable TS error trong lazyRetry
- [00:00] Chỉnh sửa `src/store/syncStore.ts` — Thêm guard chống duplicate init() khi React StrictMode double-mount, tránh tích lũy event listeners gây memory leak
- [00:00] Chỉnh sửa `src/lib/supabase.ts` — Fix setInterval không bao giờ được clear, thêm stopAuthListener() để dọn dẹp khi logout, tránh memory leak
- [00:00] Chỉnh sửa `src/store/authStore.ts` — Import stopAuthListener và gọi khi logout để clear interval session check
- [00:00] Chỉnh sửa `src/store/authStore.ts` — Thêm stopAuthListener() vào đầu hàm logout để dọn interval trước khi signOut
- [00:00] Chỉnh sửa `src/pages/QuickEntry.tsx` — Thêm useRef cleanup cho setTimeout, tránh setState trên unmounted component gây crash
- [00:00] Chỉnh sửa `src/pages/QuickEntry.tsx` — Thêm cleanup useEffect cho resetTimerRef khi component unmount
- [00:00] Chỉnh sửa `src/pages/QuickEntry.tsx` — Chuyển setTimeout offline success sang dùng resetTimerRef để có thể cleanup
- [00:00] Chỉnh sửa `src/pages/QuickEntry.tsx` — Chuyển setTimeout online success sang dùng resetTimerRef để có thể cleanup khi unmount
- [00:00] Chỉnh sửa `src/pages/owner/Dashboard.tsx` — Thêm useRef request counter để chống stale response race condition khi đổi ngày nhanh
- [00:00] Chỉnh sửa `src/pages/owner/Dashboard.tsx` — Thêm loadStatsRequestId ref vào component state
- [00:00] Chỉnh sửa `src/pages/owner/Dashboard.tsx` — Increment requestId ở đầu loadStats để track request mới nhất
- [00:00] Chỉnh sửa `src/pages/owner/Dashboard.tsx` — Thêm stale check trước setStats/setLoading, bỏ qua response cũ khi user đổi ngày nhanh
- [00:00] Chỉnh sửa `src/pages/owner/Dashboard.tsx` — Đặt stale check đúng vị trí: trước setStats thay vì sau
- [00:00] Chỉnh sửa `src/pages/owner/Appointments.tsx` — Thêm loadRequestId ref để chống stale response race condition khi đổi ngày nhanh
- [00:00] Chỉnh sửa `src/pages/owner/Appointments.tsx` — Thêm stale check trong load() để bỏ qua response cũ khi date thay đổi nhanh
- [00:00] Chỉnh sửa `src/pages/Login.tsx` — Fix handlePinInput gọi setState lồng nhau gây crash, chuyển sang useEffect trigger khi PIN đủ 4 số
- [00:00] Chỉnh sửa `src/pages/Login.tsx` — Thêm useEffect vào import
- [00:00] Chỉnh sửa `src/store/authStore.ts` — Wrap logout trong try-catch toàn bộ để không bị abort khi storage/signOut throw trên iOS
