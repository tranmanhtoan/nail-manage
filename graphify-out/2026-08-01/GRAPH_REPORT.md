# Graph Report - Nail Manange  (2026-08-01)

## Corpus Check
- 65 files · ~44,508 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 332 nodes · 450 edges · 24 communities (19 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `22d0fd28`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- QuickEntry.tsx
- Appointments.tsx
- App.tsx
- devDependencies
- compilerOptions
- What You Must Do When Invoked
- supabase.ts
- dependencies
- MCC Nail & Spa — Tổng quan Module
- validations.ts
- useAuthStore
- graphify reference: extra exports and benchmark
- [2026-07-31]
- vite-env.d.ts
- vercel.json
- graphify reference: query, path, explain
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- extraction-spec.md

## God Nodes (most connected - your core abstractions)
1. `useAuthStore` - 21 edges
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
- `Dashboard()` --calls--> `useAuthStore`  [EXTRACTED]
  src/pages/owner/Dashboard.tsx → src/store/authStore.ts
- `Login()` --calls--> `useAuthStore`  [EXTRACTED]
  src/pages/Login.tsx → src/store/authStore.ts
- `useInactivityTimeout()` --calls--> `useAuthStore`  [EXTRACTED]
  src/hooks/useInactivityTimeout.ts → src/store/authStore.ts
- `CheckIn()` --calls--> `useAuthStore`  [EXTRACTED]
  src/pages/employee/CheckIn.tsx → src/store/authStore.ts
- `MyEarnings()` --calls--> `useAuthStore`  [EXTRACTED]
  src/pages/employee/MyEarnings.tsx → src/store/authStore.ts

## Import Cycles
- None detected.

## Communities (24 total, 5 thin omitted)

### Community 0 - "QuickEntry.tsx"
Cohesion: 0.26
Nodes (8): OfflineSyncBanner(), Employee, Service, Step, FailedAction, SyncAction, SyncState, useSyncStore

### Community 1 - "Appointments.tsx"
Cohesion: 0.08
Nodes (18): Appointment, AppointmentStatus, Customer, Employee, Service, UserRole, AppointmentRow, Appointments() (+10 more)

### Community 2 - "App.tsx"
Cohesion: 0.06
Nodes (18): Appointments, BookingPage, Customers, Dashboard, EmployeeLayout, KioskLayout, PinGate, QuickEntry (+10 more)

### Community 3 - "devDependencies"
Cohesion: 0.08
Nodes (25): devDependencies, tailwindcss, @tailwindcss/vite, @types/react, @types/react-dom, typescript, vite, vite-plugin-pwa (+17 more)

### Community 4 - "compilerOptions"
Cohesion: 0.08
Nodes (25): DOM, DOM.Iterable, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions (+17 more)

### Community 5 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 6 - "supabase.ts"
Cohesion: 0.06
Nodes (25): PinGateProps, toAuthEmail(), initAuthListener(), supabase, supabaseAdmin, supabaseAnonKey, supabaseUrl, AdminDashboard() (+17 more)

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
Cohesion: 0.12
Nodes (17): BottomNav(), FloatingBackHome(), Header(), useInactivityTimeout(), PayType, CheckIn(), AppointmentRow, EarningData (+9 more)

### Community 12 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 13 - "[2026-07-31]"
Cohesion: 0.50
Nodes (3): [2026-07-31], Chỉnh sửa, MCC Nail & Spa — Changelog

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

## Knowledge Gaps
- **167 isolated node(s):** `Chỉnh sửa`, `Dashboard`, `Appointments`, `Customers`, `Settings` (+162 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `supabase` connect `supabase.ts` to `QuickEntry.tsx`, `Appointments.tsx`, `App.tsx`, `useAuthStore`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `useAuthStore` connect `useAuthStore` to `QuickEntry.tsx`, `App.tsx`, `supabase.ts`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `Chỉnh sửa`, `Dashboard`, `Appointments` to the rest of the system?**
  _167 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Appointments.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08064516129032258 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06153846153846154 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._