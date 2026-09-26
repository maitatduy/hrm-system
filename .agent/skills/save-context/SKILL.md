---
name: save-context
description: Ghi lại tiến độ công việc vào .docs/FEATURES_DONE.md sau khi hoàn thành một tính năng. Dùng khi người dùng yêu cầu lưu tiến độ, lưu ngữ cảnh, ghi nhật ký công việc, hoặc chuẩn bị kết thúc phiên chat.
triggers:
  - "/save"
  - "lưu ngữ cảnh"
---

# Nhiệm vụ: ghi nhật ký tiến độ

Khi được gọi, thực hiện các bước sau một cách im lặng, không giải thích dông dài.

1. **Quét thay đổi:** tự động kiểm tra các file vừa tạo, sửa đổi hoặc cập nhật trong phiên chat hiện tại.
2. **Tóm tắt siêu ngắn:** viết một đoạn tóm tắt dưới 50 chữ về những gì đã hoàn thành. Ví dụ, đã hoàn thành API tạo đơn nghỉ phép ở leave-service, đã thêm event publish hrm.leave.approved.
3. **Cập nhật file:** mở file .docs/FEATURES_DONE.md. Nếu tóm tắt khớp với một dòng checklist đang chưa bắt đầu hoặc đang làm dở, cập nhật dòng đó thành đã xong. Thêm một dòng mới vào mục Nhật ký cập nhật ở cuối file, kèm ngày giờ hiện tại và đoạn tóm tắt.
4. **Báo cáo:** trả lời người dùng đúng một câu, "Đã lưu tiến độ vào FEATURES_DONE.md, bạn có thể đóng phiên chat này."

Lưu ý, không ghi lại quá trình debug, không ghi lại lỗi đã gặp trong lúc làm việc. Chỉ ghi kết quả cuối cùng đã chạy thành công.
