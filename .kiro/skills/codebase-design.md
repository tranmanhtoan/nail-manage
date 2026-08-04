---
name: codebase-design
description: Shared vocabulary for designing deep modules. Use when designing or improving a module's interface, finding deepening opportunities, deciding where a seam goes, or making code more testable.
---

# Thiết kế Codebase

Thiết kế **module sâu**: nhiều hành vi đằng sau interface nhỏ, đặt tại seam sạch, testable qua interface đó.

## Từ vựng

Dùng chính xác các thuật ngữ này — không thay bằng "component," "service," "API," hay "boundary."

**Module** — bất cứ thứ gì có interface và implementation. Bất kể quy mô: function, class, package, hoặc slice xuyên tầng.

**Interface** — mọi thứ caller cần biết để dùng module đúng: type signature, invariant, ràng buộc thứ tự, error mode, config, đặc tính hiệu năng.

**Implementation** — thứ bên trong module. Khác với **Adapter**: một thứ có thể là adapter nhỏ với implementation lớn.

**Depth (Độ sâu)** — leverage tại interface: lượng hành vi caller có thể exercise trên mỗi đơn vị interface họ phải học. Sâu = hành vi lớn sau interface nhỏ. Nông = interface gần phức tạp bằng implementation.

**Seam** _(Michael Feathers)_ — nơi bạn có thể thay đổi hành vi mà không sửa tại chỗ đó; vị trí interface của module tồn tại.

**Adapter** — thứ cụ thể thỏa mãn interface tại seam. Mô tả vai trò, không phải nội dung.

**Leverage** — caller được gì từ depth: nhiều khả năng hơn trên mỗi đơn vị interface học được.

**Locality** — maintainer được gì từ depth: thay đổi, bug, kiến thức tập trung một chỗ.

## Sâu vs nông

Module sâu = interface nhỏ + nhiều implementation (tốt).
Module nông = interface lớn + ít implementation (tránh).

Khi thiết kế interface, hỏi:
- Có thể giảm số method không?
- Có thể đơn giản hóa parameter không?
- Có thể ẩn thêm complexity vào bên trong không?

## Nguyên tắc

- **Depth là thuộc tính của interface, không phải implementation.**
- **Deletion test.** Tưởng tượng xóa module. Nếu complexity xuất hiện lại ở N caller, nó đang xứng đáng.
- **Interface là bề mặt test.** Caller và test đi qua cùng seam.
- **Một adapter = seam giả thuyết. Hai adapter = seam thực.** Đừng tạo seam trừ khi thứ gì đó thực sự thay đổi qua nó.

## Thiết kế cho testability

1. **Nhận dependency, đừng tạo chúng.**
2. **Trả kết quả, đừng tạo side effect.**
3. **Bề mặt nhỏ.** Ít method = ít test cần thiết.
