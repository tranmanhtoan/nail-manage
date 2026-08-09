# Graph Report - Nail Manange  (2026-08-09)

## Corpus Check
- 81 files · ~55,637 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 445 nodes · 558 edges · 38 communities (30 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ee8bcf9a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- authStore.ts
- Appointments.tsx
- App.tsx
- devDependencies
- compilerOptions
- What You Must Do When Invoked
- supabase.ts
- dependencies
- MCC Nail & Spa — Tổng quan Module
- validations.ts
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
- Graphify Knowledge Graph
- Chẩn đoán Bug
- Trong phiên làm việc
- Quy trình
- Thiết kế Codebase
- Quy trình
- Phát triển hướng kiểm thử (TDD)
- Prototype
- Bàn giao
- Nghiên cứu
- implement.md

## God Nodes (most connected - your core abstractions)
1. `supabase` - 20 edges
2. `compilerOptions` - 19 edges
3. `useAuthStore` - 15 edges
4. `MCC Nail & Spa — Tổng quan Module` - 15 edges
5. `What You Must Do When Invoked` - 12 edges
6. `/graphify` - 10 edges
7. `graphify reference: extra exports and benchmark` - 8 edges
8. `scripts` - 7 edges
9. `Chẩn đoán Bug` - 7 edges
10. `Trong phiên làm việc` - 7 edges

## Surprising Connections (you probably didn't know these)
- `useInactivityTimeout()` --calls--> `useAuthStore`  [EXTRACTED]
  src/hooks/useInactivityTimeout.ts → src/store/authStore.ts
- `KioskPersonal()` --calls--> `useAuthStore`  [EXTRACTED]
  src/pages/kiosk/KioskPersonal.tsx → src/store/authStore.ts
- `OfflineSyncBanner()` --calls--> `useSyncStore`  [EXTRACTED]
  src/components/OfflineSyncBanner.tsx → src/store/syncStore.ts

## Import Cycles
- None detected.

## Communities (38 total, 8 thin omitted)

### Community 0 - "authStore.ts"
Cohesion: 0.09
Nodes (20): BottomNav(), FloatingBackHome(), useInactivityTimeout(), useServices(), PayType, UserRole, CheckIn(), AppointmentRow (+12 more)

### Community 1 - "Appointments.tsx"
Cohesion: 0.06
Nodes (24): UseDataResult, Appointment, AppointmentStatus, Customer, Employee, Service, AppointmentRow, Appointments() (+16 more)

### Community 2 - "App.tsx"
Cohesion: 0.06
Nodes (17): Appointments, BookingPage, Customers, Dashboard, EmployeeLayout, KioskLayout, PinGate, QuickEntry (+9 more)

### Community 3 - "devDependencies"
Cohesion: 0.07
Nodes (27): jsdom, devDependencies, jsdom, tailwindcss, @tailwindcss/vite, @testing-library/jest-dom, @testing-library/react, @types/react (+19 more)

### Community 4 - "compilerOptions"
Cohesion: 0.08
Nodes (25): DOM, DOM.Iterable, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions (+17 more)

### Community 5 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 6 - "supabase.ts"
Cohesion: 0.07
Nodes (24): LanguageSwitch(), PinGateProps, toAuthEmail(), initAuthListener(), stopAuthListener(), supabase, supabaseAdmin, supabaseAnonKey (+16 more)

### Community 7 - "dependencies"
Cohesion: 0.06
Nodes (32): i18next, lucide-react, dependencies, i18next, lucide-react, react, react-dom, react-i18next (+24 more)

### Community 8 - "MCC Nail & Spa — Tổng quan Module"
Cohesion: 0.12
Nodes (15): 10. `src/hooks/` — Custom Hooks, 11. `src/i18n/` — Đa ngôn ngữ (i18next), 12. Hạ tầng & Cấu hình, 1. `src/pages/owner/` — Module chủ tiệm (Owner), 2. `src/pages/employee/` — Module nhân viên (Employee), 3. `src/pages/kiosk/` — Module Kiosk (Tablet dùng chung), 4. `src/pages/booking/` — Module đặt lịch online (Public), 5. `src/pages/QuickEntry.tsx` — Nhập nhanh (Shared) (+7 more)

### Community 9 - "validations.ts"
Cohesion: 0.12
Nodes (14): AppointmentInput, appointmentSchema, BookingInput, bookingSchema, CustomerInput, customerSchema, EmployeeInput, employeeSchema (+6 more)

### Community 11 - "QuickEntry.tsx"
Cohesion: 0.18
Nodes (12): OfflineSyncBanner(), calculateIdleMinutes(), getShiftStartMinutes(), IdleCalcAppointment, IdleCalcEmployee, Employee, Service, Step (+4 more)

### Community 12 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 13 - "MCC Nail & Spa — Changelog"
Cohesion: 0.15
Nodes (12): [2026-07-31], [2026-08-03], [2026-08-04], [2026-08-05], [2026-08-09], Chỉnh sửa, Chỉnh sửa, Chỉnh sửa (+4 more)

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

### Community 24 - "Graphify Knowledge Graph"
Cohesion: 0.40
Nodes (4): Commands, Fallback, Graphify Knowledge Graph, When to Use

### Community 25 - "Chẩn đoán Bug"
Cohesion: 0.18
Nodes (10): Chẩn đoán Bug, Cách xây dựng — thử theo thứ tự này, Phase 1 — Xây dựng vòng phản hồi, Phase 2 — Tái hiện + tối giản, Phase 3 — Đặt giả thuyết, Phase 4 — Đo đạc, Phase 5 — Sửa + regression test, Phase 6 — Dọn dẹp + hậu kiểm (+2 more)

### Community 26 - "Trong phiên làm việc"
Cohesion: 0.20
Nodes (9): Cấu trúc file, Cập nhật CONTEXT.md inline, Mài sắc ngôn ngữ mơ hồ, Mô hình hóa Domain, Thách thức với glossary, Thảo luận kịch bản cụ thể, Trong phiên làm việc, Đề xuất ADR tiết kiệm (+1 more)

### Community 27 - "Quy trình"
Cohesion: 0.22
Nodes (8): 1. Ghim điểm cố định, 2. Xác định nguồn spec, 3. Xác định nguồn standards, 4. Chạy cả hai trục, 5. Tổng hợp, Quy trình, Review Code, Tại sao hai trục

### Community 28 - "Thiết kế Codebase"
Cohesion: 0.33
Nodes (5): Nguyên tắc, Sâu vs nông, Thiết kế cho testability, Thiết kế Codebase, Từ vựng

### Community 29 - "Quy trình"
Cohesion: 0.33
Nodes (5): 1. Khám phá, 2. Trình bày ứng viên dưới dạng báo cáo HTML, 3. Vòng grilling, Cải thiện Kiến trúc Codebase, Quy trình

### Community 30 - "Phát triển hướng kiểm thử (TDD)"
Cohesion: 0.33
Nodes (5): Anti-pattern, Phát triển hướng kiểm thử (TDD), Quy tắc vòng lặp, Seam — test đặt ở đâu, Test tốt là gì

### Community 31 - "Prototype"
Cohesion: 0.50
Nodes (3): Chọn nhánh, Prototype, Quy tắc cho cả hai

## Knowledge Gaps
- **229 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+224 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `supabase` connect `supabase.ts` to `authStore.ts`, `Appointments.tsx`, `QuickEntry.tsx`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `dependencies`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `useAuthStore` connect `authStore.ts` to `Appointments.tsx`, `App.tsx`, `QuickEntry.tsx`, `supabase.ts`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _229 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `authStore.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09411764705882353 - nodes in this community are weakly interconnected._
- **Should `Appointments.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0595959595959596 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06349206349206349 - nodes in this community are weakly interconnected._