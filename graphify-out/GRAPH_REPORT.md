# Graph Report - .  (2026-07-29)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 288 nodes · 445 edges · 17 communities (15 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5489c2ac`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- supabase.ts
- useAuthStore
- App.tsx
- devDependencies
- compilerOptions
- Employees.tsx
- Settings.tsx
- dependencies
- MCC Nail & Spa — Tổng quan Module
- validations.ts
- QuickEntry.tsx
- Dashboard.tsx
- Reports.tsx
- [2026-07-29]
- vite-env.d.ts
- vercel.json

## God Nodes (most connected - your core abstractions)
1. `useAuthStore` - 25 edges
2. `supabase` - 23 edges
3. `compilerOptions` - 19 edges
4. `MCC Nail & Spa — Tổng quan Module` - 15 edges
5. `useSyncStore` - 9 edges
6. `LanguageSwitch()` - 6 edges
7. `Service` - 6 edges
8. `ErrorBoundary` - 6 edges
9. `Header()` - 5 edges
10. `toAuthEmail()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Dashboard()` --calls--> `useAuthStore`  [EXTRACTED]
  src/pages/owner/Dashboard.tsx → src/store/authStore.ts
- `Header()` --calls--> `useSyncStore`  [EXTRACTED]
  src/components/Header.tsx → src/store/syncStore.ts
- `KioskPersonal()` --calls--> `useAuthStore`  [EXTRACTED]
  src/pages/kiosk/KioskPersonal.tsx → src/store/authStore.ts
- `Settings()` --calls--> `useAuthStore`  [EXTRACTED]
  src/pages/owner/Settings.tsx → src/store/authStore.ts
- `App()` --calls--> `useSyncStore`  [EXTRACTED]
  src/App.tsx → src/store/syncStore.ts

## Import Cycles
- None detected.

## Communities (17 total, 2 thin omitted)

### Community 0 - "supabase.ts"
Cohesion: 0.08
Nodes (20): Appointment, Customer, Service, supabase, supabaseAnonKey, supabaseUrl, AdminDashboard(), AdminStats (+12 more)

### Community 1 - "useAuthStore"
Cohesion: 0.13
Nodes (19): BottomNav(), EmployeeLayout(), FloatingBackHome(), Header(), LanguageSwitch(), useInactivityTimeout(), UserRole, CheckIn() (+11 more)

### Community 2 - "App.tsx"
Cohesion: 0.08
Nodes (16): Admin, App(), Appointments, BookingPage, Customers, Dashboard, EmployeeLayout, KioskLayout (+8 more)

### Community 3 - "devDependencies"
Cohesion: 0.08
Nodes (25): devDependencies, tailwindcss, @tailwindcss/vite, @types/react, @types/react-dom, typescript, vite, vite-plugin-pwa (+17 more)

### Community 4 - "compilerOptions"
Cohesion: 0.08
Nodes (25): DOM, DOM.Iterable, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions (+17 more)

### Community 5 - "Employees.tsx"
Cohesion: 0.11
Nodes (9): PinGateProps, toAuthEmail(), Employee, PayType, supabaseAdmin, AppointmentRow, EarningData, MyEmployee (+1 more)

### Community 6 - "Settings.tsx"
Cohesion: 0.12
Nodes (16): AppointmentStatus, AppointmentRow, Appointments(), Employee, getChibiEmoji(), RotationEmployee, RotationStatus, Service (+8 more)

### Community 7 - "dependencies"
Cohesion: 0.11
Nodes (19): i18next, lucide-react, dependencies, i18next, lucide-react, react, react-dom, react-i18next (+11 more)

### Community 8 - "MCC Nail & Spa — Tổng quan Module"
Cohesion: 0.12
Nodes (15): 10. `src/hooks/` — Custom Hooks, 11. `src/i18n/` — Đa ngôn ngữ (i18next), 12. Hạ tầng & Cấu hình, 1. `src/pages/owner/` — Module chủ tiệm (Owner), 2. `src/pages/employee/` — Module nhân viên (Employee), 3. `src/pages/kiosk/` — Module Kiosk (Tablet dùng chung), 4. `src/pages/booking/` — Module đặt lịch online (Public), 5. `src/pages/QuickEntry.tsx` — Nhập nhanh (Shared) (+7 more)

### Community 9 - "validations.ts"
Cohesion: 0.12
Nodes (14): AppointmentInput, appointmentSchema, BookingInput, bookingSchema, CustomerInput, customerSchema, EmployeeInput, employeeSchema (+6 more)

### Community 10 - "QuickEntry.tsx"
Cohesion: 0.22
Nodes (8): OfflineSyncBanner(), getChibiEmoji(), KioskPersonal(), ProfileOption, Employee, Service, Step, useSyncStore

### Community 11 - "Dashboard.tsx"
Cohesion: 0.25
Nodes (8): DailyData, Dashboard(), EmployeeOption, getMonthShort(), LineChart(), PerfTab, RecentItem, Stats

### Community 12 - "Reports.tsx"
Cohesion: 0.33
Nodes (4): EmployeeAppointment, EmployeeSummary, Period, ServiceRevenue

### Community 13 - "[2026-07-29]"
Cohesion: 0.40
Nodes (4): [2026-07-29], Chỉnh sửa, MCC Nail & Spa — Changelog, Thêm mới

## Knowledge Gaps
- **132 isolated node(s):** `Thêm mới`, `Chỉnh sửa`, `1. `src/pages/owner/` — Module chủ tiệm (Owner)`, `2. `src/pages/employee/` — Module nhân viên (Employee)`, `3. `src/pages/kiosk/` — Module Kiosk (Tablet dùng chung)` (+127 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `supabase` connect `supabase.ts` to `useAuthStore`, `Employees.tsx`, `Settings.tsx`, `QuickEntry.tsx`, `Dashboard.tsx`, `Reports.tsx`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Why does `useAuthStore` connect `useAuthStore` to `supabase.ts`, `App.tsx`, `Employees.tsx`, `Settings.tsx`, `QuickEntry.tsx`, `Dashboard.tsx`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **What connects `Thêm mới`, `Chỉnh sửa`, `1. `src/pages/owner/` — Module chủ tiệm (Owner)` to the rest of the system?**
  _132 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `supabase.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07665505226480836 - nodes in this community are weakly interconnected._
- **Should `useAuthStore` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07977207977207977 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._