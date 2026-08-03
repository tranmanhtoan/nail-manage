# Graph Report - Nail Manange  (2026-08-03)

## Corpus Check
- 65 files · ~45,388 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 337 nodes · 454 edges · 26 communities (21 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3654c13c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Settings.tsx
- Appointments.tsx
- App.tsx
- devDependencies
- compilerOptions
- What You Must Do When Invoked
- supabase.ts
- dependencies
- MCC Nail & Spa — Tổng quan Module
- validations.ts
- authStore.ts
- QuickEntry.tsx
- graphify reference: extra exports and benchmark
- MCC Nail & Spa — Changelog
- vite-env.d.ts
- vercel.json
- graphify reference: query, path, explain
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- extraction-spec.md
- Dashboard.tsx

## God Nodes (most connected - your core abstractions)
1. `supabase` - 20 edges
2. `compilerOptions` - 19 edges
3. `useAuthStore` - 18 edges
4. `MCC Nail & Spa — Tổng quan Module` - 15 edges
5. `What You Must Do When Invoked` - 12 edges
6. `/graphify` - 10 edges
7. `graphify reference: extra exports and benchmark` - 8 edges
8. `useSyncStore` - 7 edges
9. `ErrorBoundary` - 6 edges
10. `Service` - 5 edges

## Surprising Connections (you probably didn't know these)
- `KioskPersonal()` --calls--> `useAuthStore`  [EXTRACTED]
  src/pages/kiosk/KioskPersonal.tsx → src/store/authStore.ts
- `useInactivityTimeout()` --calls--> `useAuthStore`  [EXTRACTED]
  src/hooks/useInactivityTimeout.ts → src/store/authStore.ts
- `CheckIn()` --calls--> `useAuthStore`  [EXTRACTED]
  src/pages/employee/CheckIn.tsx → src/store/authStore.ts
- `MyEarnings()` --calls--> `useAuthStore`  [EXTRACTED]
  src/pages/employee/MyEarnings.tsx → src/store/authStore.ts
- `MySchedule()` --calls--> `useAuthStore`  [EXTRACTED]
  src/pages/employee/MySchedule.tsx → src/store/authStore.ts

## Import Cycles
- None detected.

## Communities (26 total, 5 thin omitted)

### Community 0 - "Settings.tsx"
Cohesion: 0.15
Nodes (9): AdminDashboard(), AdminStats, CATEGORIES, Services(), DEFAULT_TOGGLES, FeatureToggles, Tab, ThemeState (+1 more)

### Community 1 - "Appointments.tsx"
Cohesion: 0.10
Nodes (12): AppointmentRow, Appointments(), Employee, getChibiEmoji(), RotationEmployee, RotationStatus, Service, CacheEntry (+4 more)

### Community 2 - "App.tsx"
Cohesion: 0.06
Nodes (15): Appointments, BookingPage, Customers, Dashboard, EmployeeLayout, KioskLayout, PinGate, QuickEntry (+7 more)

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
Cohesion: 0.10
Nodes (12): PinGateProps, toAuthEmail(), initAuthListener(), stopAuthListener(), supabaseAdmin, supabaseAnonKey, supabaseUrl, Employees() (+4 more)

### Community 7 - "dependencies"
Cohesion: 0.11
Nodes (19): i18next, lucide-react, dependencies, i18next, lucide-react, react, react-dom, react-i18next (+11 more)

### Community 8 - "MCC Nail & Spa — Tổng quan Module"
Cohesion: 0.12
Nodes (15): 10. `src/hooks/` — Custom Hooks, 11. `src/i18n/` — Đa ngôn ngữ (i18next), 12. Hạ tầng & Cấu hình, 1. `src/pages/owner/` — Module chủ tiệm (Owner), 2. `src/pages/employee/` — Module nhân viên (Employee), 3. `src/pages/kiosk/` — Module Kiosk (Tablet dùng chung), 4. `src/pages/booking/` — Module đặt lịch online (Public), 5. `src/pages/QuickEntry.tsx` — Nhập nhanh (Shared) (+7 more)

### Community 9 - "validations.ts"
Cohesion: 0.12
Nodes (14): AppointmentInput, appointmentSchema, BookingInput, bookingSchema, CustomerInput, customerSchema, EmployeeInput, employeeSchema (+6 more)

### Community 10 - "authStore.ts"
Cohesion: 0.10
Nodes (23): BottomNav(), FloatingBackHome(), Header(), LanguageSwitch(), useInactivityTimeout(), Appointment, AppointmentStatus, Customer (+15 more)

### Community 11 - "QuickEntry.tsx"
Cohesion: 0.16
Nodes (12): OfflineSyncBanner(), getChibiEmoji(), KioskPersonal(), ProfileOption, Employee, QuickEntry(), Service, Step (+4 more)

### Community 12 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 13 - "MCC Nail & Spa — Changelog"
Cohesion: 0.33
Nodes (5): [2026-07-31], [2026-08-03], Chỉnh sửa, Chỉnh sửa, MCC Nail & Spa — Changelog

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

### Community 25 - "Dashboard.tsx"
Cohesion: 0.33
Nodes (4): DAYS, EmployeeOption, RecentItem, Stats

## Knowledge Gaps
- **169 isolated node(s):** `Chỉnh sửa`, `Chỉnh sửa`, `CacheEntry`, `DataState`, `initialLng` (+164 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `supabase` connect `authStore.ts` to `Settings.tsx`, `Appointments.tsx`, `supabase.ts`, `QuickEntry.tsx`, `Dashboard.tsx`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `useAuthStore` connect `authStore.ts` to `Settings.tsx`, `Dashboard.tsx`, `App.tsx`, `QuickEntry.tsx`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `Chỉnh sửa`, `Chỉnh sửa`, `CacheEntry` to the rest of the system?**
  _169 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Appointments.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1038961038961039 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._