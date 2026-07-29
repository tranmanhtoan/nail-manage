# Graph Report - Nail Manange  (2026-07-29)

## Corpus Check
- 58 files · ~34,295 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 288 nodes · 445 edges · 17 communities (15 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fef2b59b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- validations.ts
- Settings.tsx
- supabase.ts
- dependencies
- compilerOptions
- devDependencies
- Appointments.tsx
- Dashboard.tsx
- useAuthStore
- vite-env.d.ts
- vercel.json
- MCC Nail & Spa — Tổng quan Module
- App.tsx
- [2026-07-29]
- QuickEntry.tsx
- Reports.tsx

## God Nodes (most connected - your core abstractions)
1. `useAuthStore` - 26 edges
2. `supabase` - 23 edges
3. `compilerOptions` - 19 edges
4. `MCC Nail & Spa — Tổng quan Module` - 15 edges
5. `useSyncStore` - 8 edges
6. `ErrorBoundary` - 6 edges
7. `LanguageSwitch()` - 6 edges
8. `Service` - 6 edges
9. `BottomNav()` - 5 edges
10. `Header()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Dashboard()` --calls--> `useAuthStore`  [EXTRACTED]
  src/pages/owner/Dashboard.tsx → src/store/authStore.ts
- `BottomNav()` --indirect_call--> `Settings()`  [INFERRED]
  src/components/BottomNav.tsx → src/pages/owner/Settings.tsx
- `Header()` --calls--> `useAuthStore`  [EXTRACTED]
  src/components/Header.tsx → src/store/authStore.ts
- `QuickEntry()` --calls--> `useAuthStore`  [EXTRACTED]
  src/pages/QuickEntry.tsx → src/store/authStore.ts
- `KioskPersonal()` --calls--> `useAuthStore`  [EXTRACTED]
  src/pages/kiosk/KioskPersonal.tsx → src/store/authStore.ts

## Import Cycles
- None detected.

## Communities (17 total, 2 thin omitted)

### Community 0 - "validations.ts"
Cohesion: 0.12
Nodes (14): AppointmentInput, appointmentSchema, BookingInput, bookingSchema, CustomerInput, customerSchema, EmployeeInput, employeeSchema (+6 more)

### Community 1 - "Settings.tsx"
Cohesion: 0.10
Nodes (10): PinGateProps, toAuthEmail(), Employees(), CATEGORIES, Services(), DEFAULT_TOGGLES, FeatureToggles, Tab (+2 more)

### Community 2 - "supabase.ts"
Cohesion: 0.08
Nodes (20): Appointment, Customer, Employee, Service, supabase, supabaseAdmin, supabaseAnonKey, supabaseUrl (+12 more)

### Community 3 - "dependencies"
Cohesion: 0.11
Nodes (19): i18next, lucide-react, dependencies, i18next, lucide-react, react, react-dom, react-i18next (+11 more)

### Community 4 - "compilerOptions"
Cohesion: 0.08
Nodes (25): DOM, DOM.Iterable, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions (+17 more)

### Community 5 - "devDependencies"
Cohesion: 0.08
Nodes (25): devDependencies, tailwindcss, @tailwindcss/vite, @types/react, @types/react-dom, typescript, vite, vite-plugin-pwa (+17 more)

### Community 6 - "Appointments.tsx"
Cohesion: 0.19
Nodes (10): AppointmentStatus, AppointmentRow, Appointments(), Employee, getChibiEmoji(), RotationEmployee, RotationStatus, Service (+2 more)

### Community 7 - "Dashboard.tsx"
Cohesion: 0.25
Nodes (8): DailyData, Dashboard(), EmployeeOption, getMonthShort(), LineChart(), PerfTab, RecentItem, Stats

### Community 8 - "useAuthStore"
Cohesion: 0.11
Nodes (22): BottomNav(), EmployeeLayout(), FloatingBackHome(), LanguageSwitch(), useInactivityTimeout(), PayType, UserRole, CheckIn() (+14 more)

### Community 12 - "MCC Nail & Spa — Tổng quan Module"
Cohesion: 0.12
Nodes (15): 10. `src/hooks/` — Custom Hooks, 11. `src/i18n/` — Đa ngôn ngữ (i18next), 12. Hạ tầng & Cấu hình, 1. `src/pages/owner/` — Module chủ tiệm (Owner), 2. `src/pages/employee/` — Module nhân viên (Employee), 3. `src/pages/kiosk/` — Module Kiosk (Tablet dùng chung), 4. `src/pages/booking/` — Module đặt lịch online (Public), 5. `src/pages/QuickEntry.tsx` — Nhập nhanh (Shared) (+7 more)

### Community 13 - "App.tsx"
Cohesion: 0.08
Nodes (15): Admin, Appointments, BookingPage, Customers, Dashboard, EmployeeLayout, KioskLayout, PinGate (+7 more)

### Community 14 - "[2026-07-29]"
Cohesion: 0.40
Nodes (4): [2026-07-29], Chỉnh sửa, MCC Nail & Spa — Changelog, Thêm mới

### Community 15 - "QuickEntry.tsx"
Cohesion: 0.19
Nodes (10): Header(), OfflineSyncBanner(), getChibiEmoji(), KioskPersonal(), ProfileOption, Employee, QuickEntry(), Service (+2 more)

### Community 16 - "Reports.tsx"
Cohesion: 0.33
Nodes (4): EmployeeAppointment, EmployeeSummary, Period, ServiceRevenue

## Knowledge Gaps
- **132 isolated node(s):** `Thêm mới`, `Chỉnh sửa`, `Dashboard`, `Appointments`, `Customers` (+127 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `supabase` connect `supabase.ts` to `Settings.tsx`, `Appointments.tsx`, `Dashboard.tsx`, `useAuthStore`, `QuickEntry.tsx`, `Reports.tsx`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Why does `useAuthStore` connect `useAuthStore` to `Settings.tsx`, `supabase.ts`, `Dashboard.tsx`, `App.tsx`, `QuickEntry.tsx`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **What connects `Thêm mới`, `Chỉnh sửa`, `Dashboard` to the rest of the system?**
  _132 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `validations.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Should `Settings.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10144927536231885 - nodes in this community are weakly interconnected._
- **Should `supabase.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07610993657505286 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._