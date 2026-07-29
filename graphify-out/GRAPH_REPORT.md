# Graph Report - Nail Manange  (2026-07-29)

## Corpus Check
- 58 files · ~34,415 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 288 nodes · 443 edges · 16 communities (14 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8efbfece`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- validations.ts
- Employees.tsx
- supabase.ts
- dependencies
- compilerOptions
- devDependencies
- Settings.tsx
- Dashboard.tsx
- useAuthStore
- vite-env.d.ts
- vercel.json
- MCC Nail & Spa — Tổng quan Module
- App.tsx
- [2026-07-29]
- AdminSettings.tsx

## God Nodes (most connected - your core abstractions)
1. `useAuthStore` - 25 edges
2. `supabase` - 23 edges
3. `compilerOptions` - 19 edges
4. `MCC Nail & Spa — Tổng quan Module` - 15 edges
5. `useSyncStore` - 8 edges
6. `ErrorBoundary` - 6 edges
7. `LanguageSwitch()` - 6 edges
8. `Service` - 6 edges
9. `Header()` - 5 edges
10. `toAuthEmail()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Dashboard()` --calls--> `useAuthStore`  [EXTRACTED]
  src/pages/owner/Dashboard.tsx → src/store/authStore.ts
- `Login()` --calls--> `useAuthStore`  [EXTRACTED]
  src/pages/Login.tsx → src/store/authStore.ts
- `Settings()` --calls--> `useAuthStore`  [EXTRACTED]
  src/pages/owner/Settings.tsx → src/store/authStore.ts
- `AdminSettings()` --calls--> `useAuthStore`  [EXTRACTED]
  src/pages/owner/admin/AdminSettings.tsx → src/store/authStore.ts
- `Header()` --calls--> `useSyncStore`  [EXTRACTED]
  src/components/Header.tsx → src/store/syncStore.ts

## Import Cycles
- None detected.

## Communities (16 total, 2 thin omitted)

### Community 0 - "validations.ts"
Cohesion: 0.12
Nodes (14): AppointmentInput, appointmentSchema, BookingInput, bookingSchema, CustomerInput, customerSchema, EmployeeInput, employeeSchema (+6 more)

### Community 1 - "Employees.tsx"
Cohesion: 0.14
Nodes (5): PinGateProps, toAuthEmail(), Employee, supabaseAdmin, Employees()

### Community 2 - "supabase.ts"
Cohesion: 0.07
Nodes (20): Appointment, Customer, Service, supabase, supabaseAnonKey, supabaseUrl, AdminStats, CATEGORIES (+12 more)

### Community 3 - "dependencies"
Cohesion: 0.11
Nodes (19): i18next, lucide-react, dependencies, i18next, lucide-react, react, react-dom, react-i18next (+11 more)

### Community 4 - "compilerOptions"
Cohesion: 0.08
Nodes (25): DOM, DOM.Iterable, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions (+17 more)

### Community 5 - "devDependencies"
Cohesion: 0.08
Nodes (25): devDependencies, tailwindcss, @tailwindcss/vite, @types/react, @types/react-dom, typescript, vite, vite-plugin-pwa (+17 more)

### Community 6 - "Settings.tsx"
Cohesion: 0.12
Nodes (16): AppointmentStatus, AppointmentRow, Appointments(), Employee, getChibiEmoji(), RotationEmployee, RotationStatus, Service (+8 more)

### Community 7 - "Dashboard.tsx"
Cohesion: 0.25
Nodes (8): DailyData, Dashboard(), EmployeeOption, getMonthShort(), LineChart(), PerfTab, RecentItem, Stats

### Community 8 - "useAuthStore"
Cohesion: 0.10
Nodes (25): BottomNav(), EmployeeLayout(), FloatingBackHome(), Header(), OfflineSyncBanner(), useInactivityTimeout(), PayType, UserRole (+17 more)

### Community 12 - "MCC Nail & Spa — Tổng quan Module"
Cohesion: 0.12
Nodes (15): 10. `src/hooks/` — Custom Hooks, 11. `src/i18n/` — Đa ngôn ngữ (i18next), 12. Hạ tầng & Cấu hình, 1. `src/pages/owner/` — Module chủ tiệm (Owner), 2. `src/pages/employee/` — Module nhân viên (Employee), 3. `src/pages/kiosk/` — Module Kiosk (Tablet dùng chung), 4. `src/pages/booking/` — Module đặt lịch online (Public), 5. `src/pages/QuickEntry.tsx` — Nhập nhanh (Shared) (+7 more)

### Community 13 - "App.tsx"
Cohesion: 0.08
Nodes (15): Admin, Appointments, BookingPage, Customers, Dashboard, EmployeeLayout, KioskLayout, PinGate (+7 more)

### Community 14 - "[2026-07-29]"
Cohesion: 0.40
Nodes (4): [2026-07-29], Chỉnh sửa, MCC Nail & Spa — Changelog, Thêm mới

### Community 15 - "AdminSettings.tsx"
Cohesion: 0.15
Nodes (10): LanguageSwitch(), Login(), OwnerProfile, AdminDashboard(), AdminEmployees(), AdminServices(), AdminSettings(), DEFAULT_TOGGLES (+2 more)

## Knowledge Gaps
- **132 isolated node(s):** `Thêm mới`, `Chỉnh sửa`, `Dashboard`, `Appointments`, `Customers` (+127 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `supabase` connect `supabase.ts` to `Employees.tsx`, `Settings.tsx`, `Dashboard.tsx`, `useAuthStore`, `AdminSettings.tsx`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Why does `useAuthStore` connect `useAuthStore` to `supabase.ts`, `Settings.tsx`, `Dashboard.tsx`, `App.tsx`, `AdminSettings.tsx`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **What connects `Thêm mới`, `Chỉnh sửa`, `Dashboard` to the rest of the system?**
  _132 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `validations.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Should `Employees.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1437908496732026 - nodes in this community are weakly interconnected._
- **Should `supabase.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0743321718931475 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._