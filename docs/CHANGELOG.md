# MCC Nail & Spa — Changelog

> Log ghi lại mỗi lần update/chỉnh sửa trong dự án.

---

## [2026-08-09]

### Chỉnh sửa
- [19:00] Chỉnh sửa `src/i18n/en.json` — Thêm translation keys cho period selector Dashboard (periodToday, period7Days, period30Days, totalCustomers, perCustomerAvg)
- [19:00] Chỉnh sửa `src/i18n/vi.json` — Thêm Vietnamese translation keys cho period selector Dashboard
- [19:01] Chỉnh sửa `src/pages/owner/Dashboard.tsx` — Thêm ViewMode type và mở rộng Stats interface cho period selector (7 ngày, 30 ngày)
- [19:02] Chỉnh sửa `src/pages/owner/Dashboard.tsx` — Thêm viewMode state, weeklyLabels, totalCustomers vào stats initialization
- [19:02] Chỉnh sửa `src/pages/owner/Dashboard.tsx` — useEffect phản ứng theo cả viewMode, truyền viewMode vào loadStats
- [19:03] Chỉnh sửa `src/pages/owner/Dashboard.tsx` — Viết lại loadStats() hỗ trợ 3 chế độ day/week/month với date range, chart buckets, previous period comparison
- [19:03] Chỉnh sửa `src/pages/owner/Dashboard.tsx` — Cập nhật comment growth percentage (period over period)
- [19:04] Chỉnh sửa `src/pages/owner/Dashboard.tsx` — Chart selectedDayIndex chỉ highlight khi ở day mode
- [19:05] Chỉnh sửa `src/pages/owner/Dashboard.tsx` — Thay date navigator bằng period selector tabs (Today/7 Days/30 Days) + day navigator chỉ hiện ở day mode
- [19:05] Chỉnh sửa `src/pages/owner/Dashboard.tsx` — Cập nhật mini cards hiển thị label theo viewMode, thêm perCustomerAvg
- [19:06] Chỉnh sửa `src/pages/owner/Dashboard.tsx` — Chart section dùng dynamic weeklyLabels thay vì hardcoded DAYS, badge hiển thị theo viewMode
- [19:10] Chỉnh sửa `src/pages/owner/Reports.tsx` — Fix timezone bug trong getDateRange() dùng toLocalDateStr thay vì toISOString để tránh lệch ngày do UTC conversion
- [19:11] Chỉnh sửa `src/pages/owner/Reports.tsx` — openEmployeeDetail recalculate count/revenue/commission từ dữ liệu fetch thực tế theo period đang chọn
- [19:15] Chỉnh sửa `src/pages/owner/Reports.tsx` — Thêm Period type 'range' và import CalendarRange icon cho tính năng chọn khoảng ngày tùy chỉnh
- [19:16] Chỉnh sửa `src/pages/owner/Reports.tsx` — Thêm state rangeStart, rangeEnd, rangeError, shopPrintRef cho custom date range picker
- [19:17] Chỉnh sửa `src/pages/owner/Reports.tsx` — useEffect xử lý period 'range' với validation 31 ngày trước khi loadReport
- [19:17] Chỉnh sửa `src/pages/owner/Reports.tsx` — getDateRange() hỗ trợ period 'range' trả về rangeStart/rangeEnd
- [19:18] Chỉnh sửa `src/pages/owner/Reports.tsx` — Cập nhật fixed salary scaling trong loadReport cho period 'range'
- [19:18] Chỉnh sửa `src/pages/owner/Reports.tsx` — Cập nhật fixed salary scaling trong openEmployeeDetail cho period 'range'
- [19:19] Chỉnh sửa `src/pages/owner/Reports.tsx` — Thêm periodLabel cho 'range', hàm handleShopPrint() xuất report toàn tiệm
- [19:20] Chỉnh sửa `src/pages/owner/Reports.tsx` — UI period filters thêm nút Range, date picker với validation error, nút Print bên phải
- [19:21] Chỉnh sửa `src/pages/owner/Reports.tsx` — Thêm hidden shop report print template (employees + service revenue summary)
- [19:22] Chỉnh sửa `src/i18n/en.json` — Thêm translation keys: range, customRange, rangeMaxError, rangeInvalidError, printShopReport, shopReport
- [19:22] Chỉnh sửa `src/i18n/vi.json` — Thêm Vietnamese translation keys: range, customRange, rangeMaxError, rangeInvalidError, printShopReport, shopReport
- [19:15] Chỉnh sửa `src/pages/owner/Settings.tsx` — Đổi thứ tự tabs: System Overview, General, Services, Employees
- [19:16] Chỉnh sửa `src/pages/owner/Settings.tsx` — Thêm useNavigate import cho navigation khi bấm System Overview
- [19:17] Chỉnh sửa `src/pages/owner/Settings.tsx` — System Overview navigate tới /dashboard, default tab đổi sang general, cập nhật tab click handler
- [19:18] Chỉnh sửa `src/pages/owner/Settings.tsx` — Revert: default tab trả lại dashboard (System Overview), bỏ navigate, giữ nội dung inline như cũ
- [19:20] Chỉnh sửa `src/lib/idle-minutes.ts` — Fix bug timezone: convert UTC time từ DB sang local time trước khi tính idle minutes
- [19:22] Chỉnh sửa `src/pages/owner/Settings.tsx` — Thay Dark Mode bằng Working Hours picker (open/close time), lưu vào shop_settings + localStorage
- [19:23] Chỉnh sửa `src/lib/idle-minutes.ts` — Đổi SHIFT_START_MINUTES hardcoded sang getShiftStartMinutes() đọc từ localStorage (work_start_time)
- [19:24] Chỉnh sửa `src/lib/idle-minutes.ts` — Fix lỗi còn sót SHIFT_START_MINUTES trong nhánh activated_at
- [19:24] Chỉnh sửa `src/pages/owner/Settings.tsx` — Fix unused i18n import, thêm translation keys cho working hours
- [19:24] Chỉnh sửa `src/i18n/en.json` — Thêm keys workHours, workHoursDesc, openTime, closeTime
- [19:24] Chỉnh sửa `src/i18n/vi.json` — Thêm Vietnamese keys cho giờ làm việc
- [19:26] Chỉnh sửa `src/components/BottomNav.tsx` — Đổi vị trí Reports lên trên Quick Entry trong sidebar/bottom nav
- [19:28] Chỉnh sửa `src/pages/owner/AdminDashboard.tsx` — Cards Employees/Services/Appointments có thể click để chuyển tab hoặc navigate
- [19:28] Chỉnh sửa `src/pages/owner/Settings.tsx` — Truyền onSwitchTab callback cho AdminDashboard
- [18:30] Chỉnh sửa `src/pages/employee/MySchedule.tsx` — Fix lỗi "Cannot read properties of undefined (reading 'split')" khi item.time là undefined, thêm nullish guard
- [18:33] Chỉnh sửa `src/pages/employee/MySchedule.tsx` — Thêm fallback direct query appointments khi RPC get_my_appointments trả empty
- [18:35] Chỉnh sửa `src/components/BottomNav.tsx` — Đổi thứ tự nav employee: My Earnings lên trước Quick Entry
- [18:53] Chỉnh sửa `src/pages/employee/MySchedule.tsx` — Fix field name mismatch: RPC trả id/date/time/price thay vì apt_* prefix, bỏ fallback direct query bị RLS chặn
- [19:00] Chỉnh sửa `src/pages/employee/MySchedule.tsx` — Thêm màn hình New Appointment (modal) cho nhân viên, ẩn Assign Staff vì mặc định là nhân viên đang login
- [19:05] Chỉnh sửa `src/pages/employee/MySchedule.tsx` — Hiển thị badge trạng thái cuộc hẹn (Done, Waiting, In Progress, Cancelled) trên mỗi appointment card
- [19:10] Chỉnh sửa `src/pages/employee/MySchedule.tsx` — Thay date picker bằng tabs Today/Week/Month/Range (max 31 ngày), thêm hiển thị ngày hẹn trên mỗi card
- [19:15] Chỉnh sửa `src/pages/employee/MySchedule.tsx` — Fix Range hiện ngày tương lai: luôn query per-date (không dùng p_date_from) để lấy tất cả statuses kể cả booked
- [18:30] Chỉnh sửa `src/pages/employee/MyEarnings.tsx` — Fix cùng lỗi split undefined trong formatTime(), thêm nullish guard
- [18:31] Chỉnh sửa `src/pages/employee/MyEarnings.tsx` — Thêm fallback direct query khi RPC get_my_employee trả empty, fix không hiện earnings cho nhân viên
- [18:32] Chỉnh sửa `src/pages/employee/MyEarnings.tsx` — Thêm fallback direct query appointments khi RPC get_my_appointments trả empty (bypass RLS issue)
- [18:38] Chỉnh sửa `src/pages/employee/MyEarnings.tsx` — Fix NaN/Invalid Date: parse numeric fields với Number(), fallback time null thành '00:00'
- [18:39] Chỉnh sửa `src/pages/employee/MyEarnings.tsx` — Fix NaN trong totalRevenue/totalTips reduce: wrap Number() khi cộng apt_price/apt_tip
- [18:40] Chỉnh sửa `src/pages/employee/MyEarnings.tsx` — Fix Invalid Date và $NaN trong render: guard apt_date null, Number() cho price/tip hiển thị
- [18:45] Chỉnh sửa `src/pages/employee/MyEarnings.tsx` — Rewrite: bỏ fallback direct query (bị RLS chặn), dùng RPC per-date để bypass status filter, filter completed ở frontend
- [18:50] Chỉnh sửa `src/pages/employee/MyEarnings.tsx` — Fix root cause: RPC trả field names không có prefix apt_, thêm normalizeAptRow() để map cả 2 format
- [18:51] Chỉnh sửa `src/pages/employee/MyEarnings.tsx` — Fix get_my_employee RPC không tồn tại trong DB: thêm error handling và fallback direct query
- [18:52] Chỉnh sửa `src/pages/employee/MyEarnings.tsx` — Apply normalizeAptRow() vào kết quả RPC để map field names đúng
- [18:00] Chỉnh sửa `src/i18n/vi.json` — Thêm translation keys cho chức năng đổi Owner PIN (ownerPin, ownerPinDesc, ownerPinChanged)
- [18:00] Chỉnh sửa `src/i18n/en.json` — Thêm English translation keys cho chức năng đổi Owner PIN
- [18:02] Chỉnh sửa `src/i18n/vi.json` — Thêm key `changePin` cho section gom PIN
- [18:02] Chỉnh sửa `src/i18n/en.json` — Thêm key `changePin` cho section gom PIN
- [18:01] Chỉnh sửa `src/pages/owner/Settings.tsx` — Gom Kiosk PIN và Owner PIN thành 1 section "Change PIN" với toggle chọn KIOSK/OWNER
- [18:03] Chỉnh sửa `src/pages/owner/Settings.tsx` — Đổi saveOwnerPin dùng RPC `update_employee_pin` thay vì update trực tiếp (bypass RLS)

---

## [2026-08-05]

### Thêm mới
- [10:01] Tạo mới `src/hooks/useStoreData.ts` — Centralized React hooks (useEmployees, useServices, useCustomers, useEmployeesAndServices) wrap dataStore với auto-fetch on mount và request deduplication
- [10:13] Tạo mới `src/lib/idle-minutes.ts` — Shared utility calculateIdleMinutes() extract logic tính idle time cho employee, dùng chung giữa QuickEntry và Appointments

### Chỉnh sửa
- [10:16] Chỉnh sửa `src/pages/owner/Appointments.tsx` — Thêm import calculateIdleMinutes từ shared utility
- [10:16] Chỉnh sửa `src/pages/owner/Appointments.tsx` — Thay thế inline idle calculation bằng calculateIdleMinutes() từ shared utility, giảm ~25 dòng duplicate
- [10:15] Chỉnh sửa `src/pages/QuickEntry.tsx` — Thay thế 30+ dòng idle calculation inline bằng calculateIdleMinutes() từ shared utility
- [10:14] Chỉnh sửa `src/pages/QuickEntry.tsx` — Import calculateIdleMinutes từ shared utility để thay thế logic duplicate
- [10:12] Chỉnh sửa `src/pages/owner/Employees.tsx` — Fix TS error: wrap supabase.rpc() trong Promise.resolve() để có .catch() đúng chuẩn
- [10:11] Chỉnh sửa `src/pages/owner/Employees.tsx` — Fix TS error: đổi .catch() thành .then().catch() cho supabase RPC call (PostgrestFilterBuilder không có .catch trực tiếp)
- [10:10] Chỉnh sửa `src/pages/owner/Dashboard.tsx` — Thêm import useDataStore để hỗ trợ loadEmployees từ centralized cache
- [10:10] Chỉnh sửa `src/pages/owner/Dashboard.tsx` — Refactor loadEmployees() dùng centralized dataStore thay vì query trực tiếp, tận dụng SWR cache
- [10:09] Chỉnh sửa `src/pages/owner/Appointments.tsx` — Thêm debounce 800ms cho realtime subscription tránh reload storm khi nhiều appointments update liên tục
- [10:08] Chỉnh sửa `src/pages/owner/Dashboard.tsx` — Thêm debounce 1s cho realtime subscription để tránh reload storm khi nhiều appointments thay đổi cùng lúc
- [10:07] Chỉnh sửa `src/pages/owner/Employees.tsx` — Thay select('*') bằng explicit columns; chuyển sync_orphaned_employees RPC sang non-blocking (không chờ trước khi load data)
- [10:06] Chỉnh sửa `src/pages/owner/Customers.tsx` — Thêm server-side pagination (PAGE_SIZE=30), debounced search với ilike, select cột cụ thể thay vì SELECT *, hiển thị total count và nút Load More
- [10:05] Chỉnh sửa `src/pages/QuickEntry.tsx` — Refactor error handler dùng dataStore cache thay vì parse localStorage thủ công
- [10:04] Chỉnh sửa `src/pages/QuickEntry.tsx` — Refactor loadData() dùng centralized dataStore cho employees/services thay vì fetch trực tiếp, giảm duplicate queries và tận dụng SWR cache
- [10:03] Chỉnh sửa `src/pages/QuickEntry.tsx` — Import useDataStore để chuẩn bị refactor dùng centralized cache thay vì fetch trực tiếp từ supabase
- [10:02] Chỉnh sửa `src/pages/employee/CheckIn.tsx` — Refactor bỏ fetch services trực tiếp, dùng useServices hook từ useStoreData để tận dụng cache và deduplication
- [10:00] Chỉnh sửa `src/store/dataStore.ts` — Thêm request deduplication (inflightRequests map) để tránh duplicate fetch khi nhiều component mount đồng thời; đồng bộ localStorage cache keys giữa dataStore và QuickEntry/CheckIn; thêm activated_at vào select employees
- [10:20] Chỉnh sửa `src/index.css` — Thêm @custom-variant dark để Tailwind v4 dùng class-based dark mode thay vì prefers-color-scheme, light mode không còn phụ thuộc hệ thống
- [10:25] Chỉnh sửa `src/components/PinGate.tsx` — Đọc PIN kiosk từ VITE_KIOSK_PIN env làm fallback khi shop_settings chưa có record, thay vì hardcode 1234
- [10:30] Chỉnh sửa `src/components/PinGate.tsx` — Chuyển hoàn toàn sang đọc PIN, email, password kiosk từ bảng shop_settings, bỏ phụ thuộc biến .env

---

## [2026-08-04]

### Chỉnh sửa
- [00:00] Chỉnh sửa `src/store/authStore.ts` — Fix logout không hoạt động: set user=null TRƯỚC khi gọi signOut() để UI phản hồi ngay lập tức, tránh race condition với onAuthStateChange
- [00:00] Chỉnh sửa `src/lib/supabase.ts` — Lưu subscription từ onAuthStateChange và unsubscribe trong stopAuthListener() để tránh listener zombie gọi logout lặp lại
- [00:00] Chỉnh sửa `src/lib/supabase.ts` — Thêm unsubscribe authSubscription vào stopAuthListener() để cleanup hoàn toàn khi logout
- [00:00] Chỉnh sửa `src/components/Header.tsx` — Thêm useNavigate và navigate('/') sau logout để đảm bảo chuyển về trang login
- [00:00] Chỉnh sửa `src/pages/owner/Settings.tsx` — Thêm useNavigate và handleLogout với navigate('/') cho nút logout trong Settings
- [00:00] Chỉnh sửa `src/components/Header.tsx` — Đổi sang window.location.href='/' thay vì React Router navigate để đảm bảo logout luôn reload trang
- [00:00] Chỉnh sửa `src/pages/owner/Settings.tsx` — Đổi sang window.location.href='/' cho nút logout, bỏ useNavigate import không cần thiết

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
