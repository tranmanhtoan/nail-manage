# Graph Report - Nail Manange  (2026-07-29)

## Corpus Check
- 56 files · ~32,641 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 247 nodes · 421 edges · 15 communities (13 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `093634ae`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
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
- ErrorBoundary
- [2026-07-29]

## God Nodes (most connected - your core abstractions)
1. `useAuthStore` - 27 edges
2. `supabase` - 22 edges
3. `compilerOptions` - 19 edges
4. `MCC Nail & Spa — Tổng quan Module` - 15 edges
5. `useSyncStore` - 9 edges
6. `LanguageSwitch()` - 6 edges
7. `Settings()` - 6 edges
8. `ErrorBoundary` - 5 edges
9. `BottomNav()` - 5 edges
10. `Header()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `useAuthStore`  [EXTRACTED]
  src/App.tsx → src/store/authStore.ts
- `BottomNav()` --indirect_call--> `Settings()`  [INFERRED]
  src/components/BottomNav.tsx → src/pages/owner/Settings.tsx
- `Header()` --calls--> `useAuthStore`  [EXTRACTED]
  src/components/Header.tsx → src/store/authStore.ts
- `Login()` --calls--> `useAuthStore`  [EXTRACTED]
  src/pages/Login.tsx → src/store/authStore.ts
- `QuickEntry()` --calls--> `useAuthStore`  [EXTRACTED]
  src/pages/QuickEntry.tsx → src/store/authStore.ts

## Import Cycles
- None detected.

## Communities (15 total, 2 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.10
Nodes (22): App(), Header(), OfflineSyncBanner(), PinGate(), BookingPage(), KioskLayout(), Customers(), EmployeeAppointment (+14 more)

### Community 1 - "Settings.tsx"
Cohesion: 0.15
Nodes (10): LanguageSwitch(), Login(), OwnerProfile, AdminSettings(), DEFAULT_TOGGLES, FeatureToggles, Services(), DEFAULT_TOGGLES (+2 more)

### Community 2 - "supabase.ts"
Cohesion: 0.08
Nodes (19): PinGateProps, toAuthEmail(), Appointment, Customer, Employee, Service, supabase, supabaseAdmin (+11 more)

### Community 3 - "dependencies"
Cohesion: 0.12
Nodes (17): i18next, lucide-react, dependencies, i18next, lucide-react, react, react-dom, react-i18next (+9 more)

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
Cohesion: 0.13
Nodes (19): BottomNav(), EmployeeLayout(), FloatingBackHome(), useInactivityTimeout(), PayType, UserRole, CheckIn(), AppointmentRow (+11 more)

### Community 12 - "MCC Nail & Spa — Tổng quan Module"
Cohesion: 0.12
Nodes (15): 10. `src/hooks/` — Custom Hooks, 11. `src/i18n/` — Đa ngôn ngữ (i18next), 12. Hạ tầng & Cấu hình, 1. `src/pages/owner/` — Module chủ tiệm (Owner), 2. `src/pages/employee/` — Module nhân viên (Employee), 3. `src/pages/kiosk/` — Module Kiosk (Tablet dùng chung), 4. `src/pages/booking/` — Module đặt lịch online (Public), 5. `src/pages/QuickEntry.tsx` — Nhập nhanh (Shared) (+7 more)

### Community 13 - "ErrorBoundary"
Cohesion: 0.22
Nodes (3): ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState

### Community 14 - "[2026-07-29]"
Cohesion: 0.50
Nodes (3): [2026-07-29], MCC Nail & Spa — Changelog, Thêm mới

## Knowledge Gaps
- **102 isolated node(s):** `Thêm mới`, `1. `src/pages/owner/` — Module chủ tiệm (Owner)`, `2. `src/pages/employee/` — Module nhân viên (Employee)`, `3. `src/pages/kiosk/` — Module Kiosk (Tablet dùng chung)`, `4. `src/pages/booking/` — Module đặt lịch online (Public)` (+97 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `supabase` connect `supabase.ts` to `App.tsx`, `Settings.tsx`, `Appointments.tsx`, `Dashboard.tsx`, `useAuthStore`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `useAuthStore` connect `useAuthStore` to `App.tsx`, `Settings.tsx`, `supabase.ts`, `Dashboard.tsx`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **What connects `Thêm mới`, `1. `src/pages/owner/` — Module chủ tiệm (Owner)`, `2. `src/pages/employee/` — Module nhân viên (Employee)` to the rest of the system?**
  _102 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09848484848484848 - nodes in this community are weakly interconnected._
- **Should `supabase.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08416389811738649 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._