---
name: tdd
description: Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests.
---

# Phát triển hướng kiểm thử (TDD)

TDD là vòng lặp red -> green. Skill này là tham chiếu để vòng lặp đó tạo ra test đáng giữ.

Khi khám phá codebase, đọc `CONTEXT.md` (nếu có) để tên test và từ vựng interface khớp với ngôn ngữ domain của dự án, và tuân thủ ADR trong vùng bạn đang chạm vào.

## Test tốt là gì

Test xác minh hành vi qua interface công khai, không phải chi tiết triển khai. Code có thể thay đổi hoàn toàn; test thì không nên. Test tốt đọc như một đặc tả và sống sót qua refactor vì nó không quan tâm cấu trúc nội bộ.

## Seam — test đặt ở đâu

**Seam** là ranh giới công khai nơi bạn test: interface nơi bạn quan sát hành vi mà không chui vào bên trong. Test sống tại seam, không bao giờ test internal.

**Chỉ test tại seam đã thống nhất trước.** Trước khi viết bất kỳ test nào, viết ra các seam cần test và xác nhận với user. Không test nào được viết tại seam chưa xác nhận.

Hỏi: "Interface công khai là gì, và chúng ta nên test tại seam nào?"

## Anti-pattern

- **Gắn với triển khai** — mock collaborator nội bộ, test private method, hoặc verify qua side channel. Dấu hiệu: test break khi refactor nhưng hành vi không đổi.
- **Tautological** — assertion tính lại expected value giống cách code làm, nên nó pass by construction và không bao giờ bất đồng với code. Expected value phải đến từ nguồn sự thật độc lập.
- **Cắt ngang** — viết tất cả test trước, rồi mới implement. Thay vào đó làm theo **lát dọc** — một test -> một implementation -> lặp lại.

## Quy tắc vòng lặp

- **Red trước green.** Viết test fail trước, rồi chỉ viết đủ code để pass.
- **Một lát một lúc.** Một seam, một test, một implementation tối thiểu mỗi chu kỳ.
- **Refactoring không thuộc vòng lặp.** Nó thuộc giai đoạn review, không phải chu kỳ red -> green.
