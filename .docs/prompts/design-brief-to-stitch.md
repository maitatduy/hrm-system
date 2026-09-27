# Prompt: yêu cầu Stitch vẽ giao diện

Dùng prompt này sau khi đã có DESIGN_BRIEF.md của một màn hình, để Stitch vẽ ra bản canvas tĩnh dựa đúng trên đặc tả đã duyệt, không tự sáng tạo thêm.

```
Hãy đóng vai trò một UI Designer thực thi, chỉ vẽ theo đúng đặc tả, tuyệt đối
không tự ý sáng tạo ngoài khuôn khổ đã được phê duyệt.

Bắt buộc thực hiện theo quy trình sau:

1. Nạp dữ liệu đầu vào
- Đọc file .docs/DESIGN.md để lấy đúng bảng màu, thang bo góc và thang
  typography đang dùng cho toàn hệ thống.
- Đọc file .docs/design-briefs/[TÊN_FILE_BRIEF].md để lấy cấu trúc layout,
  danh sách component cần vẽ, số liệu spacing, và dữ liệu mẫu tiếng Việt đã
  chuẩn bị sẵn.

2. Thực thi vẽ
- Dựa vào hai file trên, tiến hành render bản vẽ giao diện đồ họa.
- Lắp ráp chính xác dữ liệu mẫu tiếng Việt trong file brief vào bản vẽ, không
  thay bằng dữ liệu tiếng Anh hoặc dữ liệu không liên quan tới nghiệp vụ HRM.
- Nếu brief có ghi rõ phạm vi breakpoint cần vẽ, desktop, tablet hoặc mobile,
  vẽ đúng đủ các phiên bản được yêu cầu, không tự ý bỏ bớt hoặc thêm phiên
  bản không có trong brief.

3. Ràng buộc kỷ luật
- Chỉ làm việc trên nền tảng vẽ UI, tuyệt đối không tạo, chỉnh sửa hoặc can
  thiệp vào bất kỳ file code vật lý nào trong thư mục dự án.
- Bắt buộc dùng đúng mã màu hex đã quy định trong DESIGN.md, ví dụ #0075de
  cho hành động chính, cấm tự chế mã hex mới không có trong file đó.
- Bắt buộc dùng đúng thang bo góc đã quy định, rounded-xs cho input, rounded-
  full cho nút hành động chính và badge dạng pill, không trộn lẫn tuỳ ý.

Sau khi hoàn thiện bản vẽ, báo cáo đúng một câu, "Đã vẽ xong giao diện, sẵn
sàng cho Antigravity thi công code."
```
