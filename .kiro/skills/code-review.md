---
name: code-review
description: Two-axis review of changes — Standards (does code follow repo coding standards?) and Spec (does code match what the issue/PRD asked for?). Use when the user wants to review a branch, PR, or work-in-progress changes.
---

# Review Code

Review hai trục của diff giữa `HEAD` và một điểm cố định user cung cấp:

- **Standards** — code có tuân thủ coding standards đã document của repo không?
- **Spec** — code có triển khai đúng issue / PRD / spec gốc không?

## Quy trình

### 1. Ghim điểm cố định

Bất kỳ thứ gì user nói là điểm cố định. Capture diff: `git diff <fixed-point>...HEAD`. Cũng ghi lại commits qua `git log <fixed-point>..HEAD --oneline`.

### 2. Xác định nguồn spec

Tìm spec gốc:
1. Tham chiếu issue trong commit message
2. Path mà user đưa
3. File PRD/spec khớp tên branch
4. Hỏi user nếu không tìm thấy

### 3. Xác định nguồn standards

Bất kỳ thứ gì trong repo document cách code nên được viết, cộng thêm **baseline mùi code** (Fowler code smells):

- **Mysterious Name** — tên không tiết lộ chức năng
- **Duplicated Code** — cùng logic shape ở nhiều hunk
- **Feature Envy** — method chạm vào data của object khác nhiều hơn của mình
- **Data Clumps** — cùng vài field luôn đi cùng nhau
- **Primitive Obsession** — primitive thay cho domain concept
- **Repeated Switches** — cùng switch/if-cascade lặp lại
- **Shotgun Surgery** — một thay đổi buộc sửa rải rác
- **Divergent Change** — một file bị sửa vì lý do không liên quan
- **Speculative Generality** — abstraction thêm cho nhu cầu spec không có
- **Message Chains** — chuỗi navigation dài
- **Middle Man** — class chủ yếu delegate
- **Refused Bequest** — subclass bỏ qua phần lớn thứ nó kế thừa

Repo override baseline. Mỗi mùi là judgement call, không phải vi phạm cứng.

### 4. Chạy cả hai trục

**Standards**: Báo cáo theo file/hunk nơi diff vi phạm standard đã document hoặc có baseline smell.

**Spec**: Báo cáo (a) requirement thiếu, (b) scope creep, (c) implementation sai. Trích dẫn dòng spec cho mỗi finding.

### 5. Tổng hợp

Trình bày dưới heading `## Standards` và `## Spec`. Kết thúc bằng tóm tắt một dòng: tổng finding mỗi trục và issue tệ nhất trong mỗi trục.

## Tại sao hai trục

Một thay đổi có thể pass trục này và fail trục kia. Báo cáo riêng ngăn một trục che khuất trục còn lại.
