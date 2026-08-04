---
name: domain-modeling
description: Build and sharpen a project's domain model. Use when the user wants to pin down domain terminology, record architectural decisions, or maintain the ubiquitous language.
---

# Mô hình hóa Domain

Chủ động xây dựng và mài sắc mô hình domain của dự án khi thiết kế. Thách thức thuật ngữ, tạo kịch bản edge-case, viết glossary và quyết định ngay khi chúng kết tinh.

## Cấu trúc file

```
/
+-- CONTEXT.md              <- glossary (chỉ ngôn ngữ domain, không chi tiết triển khai)
+-- docs/
    +-- adr/
        +-- 0001-*.md       <- bản ghi quyết định kiến trúc
```

Tạo file lazy — chỉ khi có gì để viết.

## Trong phiên làm việc

### Thách thức với glossary

Khi user dùng thuật ngữ xung đột với ngôn ngữ hiện có trong `CONTEXT.md`, chỉ ra ngay: "Glossary định nghĩa 'X' là Y, nhưng bạn có vẻ muốn nói Z — cái nào đúng?"

### Mài sắc ngôn ngữ mơ hồ

Khi user dùng thuật ngữ mơ hồ hoặc đa nghĩa, đề xuất thuật ngữ chuẩn chính xác.

### Thảo luận kịch bản cụ thể

Stress-test mối quan hệ domain bằng kịch bản cụ thể thăm dò edge case.

### Đối chiếu với code

Khi user phát biểu cách thứ gì đó hoạt động, kiểm tra code có đồng ý không. Bề mặt hóa mâu thuẫn.

### Cập nhật CONTEXT.md inline

Khi thuật ngữ được giải quyết, cập nhật `CONTEXT.md` ngay tại chỗ. Đừng gom lại.

`CONTEXT.md` phải hoàn toàn không có chi tiết triển khai — nó chỉ là glossary.

### Đề xuất ADR tiết kiệm

Chỉ khi cả ba đều đúng:
1. Khó đảo ngược
2. Bất ngờ nếu không có context
3. Kết quả của trade-off thực
