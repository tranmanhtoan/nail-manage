# Graph Report - Nail Manange  (2026-07-29)

## Corpus Check
- 57 files · ~33,168 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 278 nodes · 428 edges · 16 communities (14 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `681f2ac1`
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
- ErrorBoundary

## God Nodes (most connected - your core abstractions)
1. `useAuthStore` - 26 edges
2. `supabase` - 22 edges
3. `compilerOptions` - 19 edges
4. `MCC Nail & Spa — Tổng quan Module` - 15 edges
5. `useSyncStore` - 8 edges
6. `ErrorBoundary` - 6 edges
7. `LanguageSwitch()` - 6 edges
8. `BottomNav()` - 5 edges
9. `Header()` - 5 edges
10. `toAuthEmail()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Dashboard()` --calls--> `useAuthStore`  [EXTRACTED]
  src/pages/owner/Dashboard.tsx → src/store/authStore.ts
- `BottomNav()` --indirect_call--> `Settings()`  [INFERRED]
  src/components/BottomNav.tsx → src/pages/owner/Settings.tsx
- `Header()` --calls--> `useAuthStore`  [EXTRACTED]
  src/components/Header.tsx → src/store/authStore.ts
- `Login()` --calls--> `useAuthStore`  [EXTRACTED]
  src/pages/Login.tsx → src/store/authStore.ts
- `Settings()` --calls--> `useSuperModeStore`  [EXTRACTED]
  src/pages/owner/Settings.tsx → src/store/superModeStore.ts

## Import Cycles
- None detected.

## Communities (16 total, 2 thin omitted)

### Community 0 - "validations.ts"
Cohesion: 0.12
Nodes (14): AppointmentInput, appointmentSchema, BookingInput, bookingSchema, CustomerInput, customerSchema, EmployeeInput, employeeSchema (+6 more)

### Community 1 - "Settings.tsx"
Cohesion: 0.20
Nodes (7): CATEGORIES, Services(), DEFAULT_TOGGLES, FeatureToggles, Tab, ThemeState, useThemeStore

### Community 2 - "supabase.ts"
Cohesion: 0.06
Nodes (24): PinGateProps, toAuthEmail(), Appointment, Customer, Employee, Service, supabase, supabaseAdmin (+16 more)

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
Cohesion: 0.12
Nodes (20): BottomNav(), EmployeeLayout(), FloatingBackHome(), useInactivityTimeout(), PayType, UserRole, CheckIn(), AppointmentRow (+12 more)

### Community 12 - "MCC Nail & Spa — Tổng quan Module"
Cohesion: 0.12
Nodes (15): 10. `src/hooks/` — Custom Hooks, 11. `src/i18n/` — Đa ngôn ngữ (i18next), 12. Hạ tầng & Cấu hình, 1. `src/pages/owner/` — Module chủ tiệm (Owner), 2. `src/pages/employee/` — Module nhân viên (Employee), 3. `src/pages/kiosk/` — Module Kiosk (Tablet dùng chung), 4. `src/pages/booking/` — Module đặt lịch online (Public), 5. `src/pages/QuickEntry.tsx` — Nhập nhanh (Shared) (+7 more)

### Community 13 - "App.tsx"
Cohesion: 0.08
Nodes (23): Admin, Appointments, BookingPage, Customers, Dashboard, EmployeeLayout, KioskLayout, PinGate (+15 more)

### Community 14 - "[2026-07-29]"
Cohesion: 0.40
Nodes (4): [2026-07-29], Chỉnh sửa, MCC Nail & Spa — Changelog, Thêm mới

### Community 15 - "ErrorBoundary"
Cohesion: 0.22
Nodes (3): ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState

## Knowledge Gaps
- **129 isolated node(s):** `Thêm mới`, `Chỉnh sửa`, `name`, `private`, `version` (+124 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `supabase` connect `supabase.ts` to `Settings.tsx`, `Appointments.tsx`, `Dashboard.tsx`, `useAuthStore`, `App.tsx`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `useAuthStore` connect `useAuthStore` to `Settings.tsx`, `supabase.ts`, `App.tsx`, `Dashboard.tsx`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `ErrorBoundary` connect `ErrorBoundary` to `App.tsx`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `Thêm mới`, `Chỉnh sửa`, `name` to the rest of the system?**
  _129 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `validations.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Should `supabase.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06095791001451379 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._