# Graph Report - Nail Manange  (2026-07-30)

## Corpus Check
- 64 files · ~43,706 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 332 nodes · 453 edges · 26 communities (21 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7926bb4f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Employees.tsx
- Appointments.tsx
- App.tsx
- devDependencies
- compilerOptions
- What You Must Do When Invoked
- Settings.tsx
- dependencies
- MCC Nail & Spa — Tổng quan Module
- validations.ts
- useAuthStore
- supabase.ts
- graphify reference: extra exports and benchmark
- [2026-07-29]
- vite-env.d.ts
- vercel.json
- graphify reference: query, path, explain
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- extraction-spec.md
- ErrorBoundary

## God Nodes (most connected - your core abstractions)
1. `useAuthStore` - 22 edges
2. `supabase` - 20 edges
3. `compilerOptions` - 19 edges
4. `MCC Nail & Spa — Tổng quan Module` - 15 edges
5. `What You Must Do When Invoked` - 12 edges
6. `/graphify` - 10 edges
7. `graphify reference: extra exports and benchmark` - 8 edges
8. `useSyncStore` - 7 edges
9. `ErrorBoundary` - 6 edges
10. `Service` - 5 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `useAuthStore`  [EXTRACTED]
  src/App.tsx → src/store/authStore.ts
- `Login()` --calls--> `useAuthStore`  [EXTRACTED]
  src/pages/Login.tsx → src/store/authStore.ts
- `Dashboard()` --calls--> `useAuthStore`  [EXTRACTED]
  src/pages/owner/Dashboard.tsx → src/store/authStore.ts
- `AppointmentRow` --references--> `AppointmentStatus`  [EXTRACTED]
  src/pages/owner/Appointments.tsx → src/lib/database.types.ts
- `AuthState` --references--> `UserRole`  [EXTRACTED]
  src/store/authStore.ts → src/lib/database.types.ts

## Import Cycles
- None detected.

## Communities (26 total, 5 thin omitted)

### Community 0 - "Employees.tsx"
Cohesion: 0.18
Nodes (4): PinGateProps, toAuthEmail(), supabaseAdmin, Employees()

### Community 1 - "Appointments.tsx"
Cohesion: 0.10
Nodes (15): Appointment, AppointmentStatus, Customer, Employee, Service, AppointmentRow, Appointments(), Employee (+7 more)

### Community 2 - "App.tsx"
Cohesion: 0.10
Nodes (16): Appointments, BookingPage, Customers, Dashboard, EmployeeLayout, KioskLayout, PinGate, QuickEntry (+8 more)

### Community 3 - "devDependencies"
Cohesion: 0.08
Nodes (25): devDependencies, tailwindcss, @tailwindcss/vite, @types/react, @types/react-dom, typescript, vite, vite-plugin-pwa (+17 more)

### Community 4 - "compilerOptions"
Cohesion: 0.08
Nodes (25): DOM, DOM.Iterable, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions (+17 more)

### Community 5 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 6 - "Settings.tsx"
Cohesion: 0.15
Nodes (9): AdminDashboard(), AdminStats, CATEGORIES, Services(), DEFAULT_TOGGLES, FeatureToggles, Tab, SuperModeState (+1 more)

### Community 7 - "dependencies"
Cohesion: 0.11
Nodes (19): i18next, lucide-react, dependencies, i18next, lucide-react, react, react-dom, react-i18next (+11 more)

### Community 8 - "MCC Nail & Spa — Tổng quan Module"
Cohesion: 0.12
Nodes (15): 10. `src/hooks/` — Custom Hooks, 11. `src/i18n/` — Đa ngôn ngữ (i18next), 12. Hạ tầng & Cấu hình, 1. `src/pages/owner/` — Module chủ tiệm (Owner), 2. `src/pages/employee/` — Module nhân viên (Employee), 3. `src/pages/kiosk/` — Module Kiosk (Tablet dùng chung), 4. `src/pages/booking/` — Module đặt lịch online (Public), 5. `src/pages/QuickEntry.tsx` — Nhập nhanh (Shared) (+7 more)

### Community 9 - "validations.ts"
Cohesion: 0.12
Nodes (14): AppointmentInput, appointmentSchema, BookingInput, bookingSchema, CustomerInput, customerSchema, EmployeeInput, employeeSchema (+6 more)

### Community 10 - "useAuthStore"
Cohesion: 0.09
Nodes (24): App(), BottomNav(), FloatingBackHome(), useInactivityTimeout(), PayType, UserRole, CheckIn(), AppointmentRow (+16 more)

### Community 11 - "supabase.ts"
Cohesion: 0.13
Nodes (16): OfflineSyncBanner(), initAuthListener(), supabase, supabaseAnonKey, supabaseUrl, EmployeeAppointment, EmployeeSummary, Period (+8 more)

### Community 12 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 13 - "[2026-07-29]"
Cohesion: 0.25
Nodes (7): [2026-07-29], [2026-07-30], Chỉnh sửa, Chỉnh sửa, MCC Nail & Spa — Changelog, Thêm mới, Tích hợp

### Community 17 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 18 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 19 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 20 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 25 - "ErrorBoundary"
Cohesion: 0.22
Nodes (3): ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState

## Knowledge Gaps
- **168 isolated node(s):** `Tab`, `FeatureToggles`, `DEFAULT_TOGGLES`, `Thêm mới`, `Chỉnh sửa` (+163 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `supabase` connect `supabase.ts` to `Employees.tsx`, `Appointments.tsx`, `App.tsx`, `Settings.tsx`, `useAuthStore`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `useAuthStore` connect `useAuthStore` to `App.tsx`, `supabase.ts`, `Settings.tsx`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `Tab`, `FeatureToggles`, `DEFAULT_TOGGLES` to the rest of the system?**
  _168 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Appointments.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09971509971509972 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._