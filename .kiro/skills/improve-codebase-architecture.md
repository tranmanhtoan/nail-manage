---
name: improve-codebase-architecture
description: Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one the user picks.
---

# Cải thiện Kiến trúc Codebase

Bề mặt hóa ma sát kiến trúc và đề xuất **cơ hội làm sâu** — refactor biến module nông thành module sâu. Mục tiêu là testability và AI-navigability.

Dùng từ vựng `/codebase-design`: **module**, **interface**, **depth**, **seam**, **adapter**, **leverage**, **locality**.

## Quy trình

### 1. Khám phá

**Xác định phạm vi trước khi scan — YAGNI.** Ưu tiên phần codebase thay đổi gần đây:

- Nếu user chỉ hướng, theo nó.
- Nếu không, xem commit history tìm hot spot.
- Đọc `CONTEXT.md` và ADR trong vùng đó trước.

Sau đó khám phá tự nhiên và ghi nhận ma sát:
- Đâu cần nhảy qua nhiều module nhỏ để hiểu một concept?
- Module nào nông?
- Đâu đã tách pure function chỉ cho testability nhưng bug thực ẩn trong cách chúng được gọi?
- Module nào gắn chặt leak qua seam?
- Phần nào chưa test hoặc khó test qua interface hiện tại?

Áp dụng **deletion test**: xóa nó có tập trung complexity, hay chỉ di chuyển nó?

### 2. Trình bày ứng viên dưới dạng báo cáo HTML

Viết file HTML khép kín (Tailwind + Mermaid qua CDN) vào thư mục temp OS. Cho mỗi ứng viên:

- **Files** liên quan
- **Vấn đề** — tại sao kiến trúc hiện tại gây ma sát
- **Giải pháp** — mô tả tiếng Việt bình thường
- **Lợi ích** — về locality và leverage
- **Sơ đồ trước / sau**
- **Mức khuyến nghị** — Mạnh / Đáng khám phá / Suy đoán

Kết thúc bằng **Khuyến nghị hàng đầu**.

KHÔNG đề xuất interface yet. Hỏi: "Bạn muốn khám phá cái nào?"

### 3. Vòng grilling

Khi user chọn ứng viên, chạy phiên `/grilling` để đi qua cây quyết định. Cập nhật domain model inline khi quyết định kết tinh.
