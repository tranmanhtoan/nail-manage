---
name: handoff
description: Compact the current conversation into a handoff document for another agent to pick up.
---

# Bàn giao

Viết tài liệu bàn giao tóm tắt cuộc trò chuyện hiện tại để agent mới có thể tiếp tục công việc.

## Quy tắc

- Lưu vào thư mục temp của OS, không phải workspace.
- Bao gồm phần "suggested skills" khuyến nghị skill cho phiên tiếp theo.
- Không lặp lại nội dung đã capture trong artifact khác (spec, plan, ADR, issue, commit, diff). Tham chiếu bằng path hoặc URL.
- Biên tập thông tin nhạy cảm (API key, password, PII).
- Nếu user chỉ định phiên tiếp sẽ tập trung vào gì, điều chỉnh tài liệu theo.
