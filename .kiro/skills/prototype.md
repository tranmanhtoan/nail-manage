---
name: prototype
description: Build a throwaway prototype to answer a design question. Use when the user wants to sanity-check a state model/logic or explore what a UI should look like.
---

# Prototype

Prototype là **code vứt đi để trả lời một câu hỏi**. Câu hỏi quyết định hình dạng.

## Chọn nhánh

- **"Logic / state model này có hợp lý không?"** -> Xây app terminal nhỏ đẩy state machine qua các case khó lý luận trên giấy.
- **"Cái này nên trông thế nào?"** -> Tạo nhiều biến thể UI khác biệt triệt để trên một route, chuyển đổi qua URL param.

Nếu mơ hồ, mặc định theo thứ gì khớp code xung quanh (backend -> logic; page/component -> UI).

## Quy tắc cho cả hai

1. **Vứt đi từ ngày đầu, đánh dấu rõ ràng.** Đặt gần nơi nó sẽ được dùng nhưng đặt tên để người đọc biết nó là prototype.
2. **Một lệnh để chạy.** Dùng task runner hiện có của dự án.
3. **Không persistence mặc định.** State sống trong memory.
4. **Bỏ qua polish.** Không test, không error handling ngoài mức chạy được, không abstraction.
5. **Hiện state.** Sau mỗi action, in/render toàn bộ state liên quan.
6. **Capture khi xong.** Đưa quyết định đã validate vào code thật, commit prototype vào branch vứt đi, để lại pointer.
