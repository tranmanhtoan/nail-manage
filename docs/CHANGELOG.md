# MCC Nail & Spa — Changelog

> Log ghi lại mỗi lần update/chỉnh sửa trong dự án.

---

## [2026-07-31]

### Chỉnh sửa
- [00:00] Chỉnh sửa `src/i18n/index.ts` — Wrap localStorage.getItem trong try-catch để tránh crash trên iOS Safari Private Browsing
- [00:00] Chỉnh sửa `src/store/superModeStore.ts` — Wrap localStorage access trong try-catch để tránh crash trên iOS Safari Private Browsing
- [00:00] Chỉnh sửa `src/App.tsx` — Thêm lazyRetry mechanism cho dynamic imports, tự retry khi chunk load fail trên mạng yếu/iOS
- [00:00] Chỉnh sửa `src/store/authStore.ts` — Thêm timeout 5s cho checkSession, wrap localStorage/sessionStorage trong try-catch để tránh stuck loading trên iOS
- [00:00] Chỉnh sửa `src/index.css` — Cải thiện safe-area-inset CSS cho notch devices, thêm overscroll-behavior và padding cho body/root
- [00:00] Chỉnh sửa `src/main.tsx` — Thêm SW update detection handler để force reload khi có version mới, fix iOS cache stuck
- [00:00] Chỉnh sửa `src/App.tsx` — Fix unused variable TS error trong lazyRetry
