---
name: diagnosing-bugs
description: Diagnosis loop for hard bugs and performance regressions. Use when the user says "diagnose"/"debug this", or reports something broken/throwing/failing/slow.
---

# Chẩn đoán Bug

Kỷ luật cho bug khó. Chỉ bỏ qua phase khi có lý do rõ ràng.

Khi khám phá codebase, đọc `CONTEXT.md` (nếu có) để có mental model rõ ràng về các module liên quan, và kiểm tra ADR trong vùng bạn đang chạm vào.

## Phase 1 — Xây dựng vòng phản hồi

**Đây là kỹ năng cốt lõi.** Nếu bạn có tín hiệu pass/fail chặt cho bug — tín hiệu đỏ đúng với bug này — bạn sẽ tìm ra nguyên nhân. Nếu không có, nhìn code bao nhiêu cũng không cứu được.

### Cách xây dựng — thử theo thứ tự này

1. **Test fail** tại seam nào chạm tới bug
2. **Curl / HTTP script** chạy trên dev server
3. **CLI invocation** với fixture input, diff stdout với snapshot đã biết
4. **Headless browser script** (Playwright/Puppeteer)
5. **Replay trace đã capture** qua code path riêng biệt
6. **Harness tạm** — subset tối thiểu của hệ thống exercise bug code path
7. **Property / fuzz loop** — chạy 1000 input ngẫu nhiên tìm failure mode
8. **Bisection harness** — tự động `git bisect run`
9. **Differential loop** — chạy cùng input qua phiên bản cũ vs mới và diff output
10. **HITL bash script** — giải pháp cuối, human-in-the-loop có cấu trúc

### Siết chặt vòng lặp

Khi đã có vòng lặp, siết nó: nhanh hơn, tín hiệu rõ hơn, deterministic hơn.

### Tiêu chí hoàn thành

Phase 1 xong khi bạn có **một lệnh** mà:
- Có khả năng đỏ — assert đúng triệu chứng của user
- Deterministic — cùng kết quả mỗi lần chạy
- Nhanh — giây, không phải phút
- Agent chạy được — không cần human

**Nếu bạn thấy mình đang đọc code để xây theory trước khi lệnh này tồn tại, dừng lại.**

## Phase 2 — Tái hiện + tối giản

Chạy vòng lặp. Xem nó đỏ. Xác nhận nó khớp với failure mà user mô tả.

Tối giản: thu nhỏ repro thành scenario nhỏ nhất vẫn đỏ. Cắt input, caller, config, data từng cái một. Xong khi mọi phần tử còn lại đều là load-bearing.

## Phase 3 — Đặt giả thuyết

Tạo **3-5 giả thuyết xếp hạng** trước khi test bất kỳ cái nào. Mỗi cái phải falsifiable: nêu dự đoán.

> "Nếu <X> là nguyên nhân, thì <thay đổi Y> sẽ làm bug biến mất / <thay đổi Z> sẽ làm nó tệ hơn."

Trình danh sách xếp hạng cho user trước khi test.

## Phase 4 — Đo đạc

Mỗi probe phải map tới một dự đoán cụ thể. Thay đổi một biến một lúc.

Ưu tiên công cụ:
1. Debugger / REPL inspection
2. Log có mục tiêu tại ranh giới phân biệt giả thuyết
3. Không bao giờ "log hết rồi grep"

Tag mỗi debug log với prefix duy nhất (vd `[DEBUG-a4f2]`).

## Phase 5 — Sửa + regression test

1. Biến repro tối giản thành test fail (nếu có seam đúng)
2. Xem nó fail
3. Áp dụng fix
4. Xem nó pass
5. Chạy lại vòng phản hồi Phase 1

## Phase 6 — Dọn dẹp + hậu kiểm

- Repro gốc không còn tái hiện
- Regression test pass
- Tất cả `[DEBUG-...]` đã xóa
- Prototype tạm đã xóa
- Giả thuyết đúng được ghi trong commit message

Sau đó hỏi: cái gì đã có thể ngăn bug này?
