# Graph Report - Nail Manange  (2026-07-30)

## Corpus Check
- 68 files · ~44,947 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 350 nodes · 493 edges · 25 communities (20 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `539938cc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- supabase.ts
- Dashboard.tsx
- App.tsx
- devDependencies
- compilerOptions
- What You Must Do When Invoked
- Settings.tsx
- dependencies
- MCC Nail & Spa — Tổng quan Module
- validations.ts
- useAuthStore
- QuickEntry.tsx
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

## God Nodes (most connected - your core abstractions)
1. `useAuthStore` - 24 edges
2. `supabase` - 23 edges
3. `compilerOptions` - 19 edges
4. `MCC Nail & Spa — Tổng quan Module` - 15 edges
5. `What You Must Do When Invoked` - 12 edges
6. `/graphify` - 10 edges
7. `graphify reference: extra exports and benchmark` - 8 edges
8. `useSyncStore` - 8 edges
9. `ErrorBoundary` - 6 edges
10. `LanguageSwitch()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Header()` --calls--> `useSyncStore`  [EXTRACTED]
  src/components/Header.tsx → src/store/syncStore.ts
- `QuickEntry()` --calls--> `useAuthStore`  [EXTRACTED]
  src/pages/QuickEntry.tsx → src/store/authStore.ts
- `KioskPersonal()` --calls--> `useAuthStore`  [EXTRACTED]
  src/pages/kiosk/KioskPersonal.tsx → src/store/authStore.ts
- `Settings()` --calls--> `useAuthStore`  [EXTRACTED]
  src/pages/owner/Settings.tsx → src/store/authStore.ts
- `AdminSettings()` --calls--> `useAuthStore`  [EXTRACTED]
  src/pages/owner/admin/AdminSettings.tsx → src/store/authStore.ts

## Import Cycles
- None detected.

## Communities (25 total, 5 thin omitted)

### Community 0 - "supabase.ts"
Cohesion: 0.05
Nodes (27): PinGateProps, toAuthEmail(), Appointment, Customer, Employee, PayType, Service, supabase (+19 more)

### Community 1 - "Dashboard.tsx"
Cohesion: 0.33
Nodes (4): DAYS, EmployeeOption, RecentItem, Stats

### Community 2 - "App.tsx"
Cohesion: 0.07
Nodes (15): Admin, Appointments, BookingPage, Customers, Dashboard, EmployeeLayout, KioskLayout, PinGate (+7 more)

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
Cohesion: 0.11
Nodes (17): AppointmentStatus, AppointmentRow, Appointments(), Employee, getChibiEmoji(), RotationEmployee, RotationStatus, Service (+9 more)

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
Nodes (20): BottomNav(), EmployeeLayout(), FloatingBackHome(), Header(), LanguageSwitch(), useInactivityTimeout(), UserRole, CheckIn() (+12 more)

### Community 11 - "QuickEntry.tsx"
Cohesion: 0.16
Nodes (12): OfflineSyncBanner(), getChibiEmoji(), KioskPersonal(), ProfileOption, Employee, QuickEntry(), Service, Step (+4 more)

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

## Knowledge Gaps
- **174 isolated node(s):** `Thêm mới`, `Chỉnh sửa`, `Tích hợp`, `Chỉnh sửa`, `Dashboard` (+169 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `supabase` connect `supabase.ts` to `Dashboard.tsx`, `useAuthStore`, `QuickEntry.tsx`, `Settings.tsx`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `useAuthStore` connect `useAuthStore` to `supabase.ts`, `Dashboard.tsx`, `App.tsx`, `Settings.tsx`, `QuickEntry.tsx`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `Thêm mới`, `Chỉnh sửa`, `Tích hợp` to the rest of the system?**
  _174 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `supabase.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.054098360655737705 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._