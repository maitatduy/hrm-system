# Prompt: chuyển FRONTEND_PLAN.md sang DESIGN_BRIEF.md

Dùng prompt này sau khi đã có cặp IDEA.md và FRONTEND_PLAN.md của một màn hình, để sinh ra bản đặc tả UI chi tiết cho công cụ vẽ đọc.

```
Hãy đóng vai trò Lead UI/UX Engineer.

Nhiệm vụ của bạn là đọc ba file sau:
1. File ý tưởng, .docs/ideas/[TÊN_FILE_IDEA].md, để lấy vibe, cảm xúc và ràng buộc
   UX mong muốn cho màn hình này.
2. File kế hoạch, .docs/frontend-plans/[TÊN_FILE_PLAN].md, để lấy sơ đồ component
   và biết chính xác component nào được đánh nhãn [DUMB].
3. File .docs/DESIGN.md, để lấy đúng bảng màu, thang bo góc, thang typography và
   spacing đang dùng cho toàn hệ thống.

Hãy tổng hợp và xuất ra file .docs/design-briefs/[TÊN_FILE_BRIEF].md. Đây là bản
đặc tả dạng máy đọc máy, dành cho một AI khác đọc để vẽ giao diện, do đó không
viết văn xuôi dài dòng. Bắt buộc tuân thủ định dạng sau:

1. Hệ thống lưới và bố cục
- Xác định rõ cấu trúc root, ví dụ max-w-md mx-auto cho card, hoặc min-h-screen
  cho toàn trang.
- Xác định rõ grid hoặc flexbox cho các khối chính, ví dụ desktop chia sidebar
  cố định và nội dung chính, mobile xếp chồng một cột.
- Quy định khoảng cách chuẩn bằng đúng thang spacing trong DESIGN.md, ví dụ
  spacing-lg cho padding card, spacing-sm cho khoảng cách giữa các field.

2. Đặc tả component
- Chỉ liệt kê các component được đánh nhãn [DUMB] trong file kế hoạch, bỏ qua
  toàn bộ component [SMART] vì đó là phần logic, không phải phần hình ảnh.
- Ứng với mỗi dumb component, quy định rõ:
  - Box style, bo góc theo đúng token, rounded-xs, rounded-md, rounded-lg hoặc
    rounded-full, có viền hairline hay không, có shadow hay không.
  - Typography, dùng đúng tên thang chữ trong DESIGN.md, ví dụ heading-3 cho
    tiêu đề card, body-sm cho nội dung, caption cho ghi chú nhỏ.
  - Trạng thái tương tác, hover, active, disabled, ví dụ nút primary khi hover
    chuyển sang primary-active, input khi disabled giảm độ đậm chữ.

3. Ràng buộc màu sắc
- Dịch mọi màu sắc nhắc tới trong file ý tưởng sang đúng mã hex đã định nghĩa
  trong .docs/DESIGN.md, ví dụ hành động chính là #0075de, nền trang là #f6f5f4.
- Tuyệt đối không tự chế mã hex mới ngoài bảng màu trong DESIGN.md, trừ khi
  DESIGN.md đã ghi rõ đây là màu cần bổ sung, ví dụ accent-danger.

4. Mock data
- Cung cấp sẵn dữ liệu mẫu bằng tiếng Việt, đúng ngữ cảnh nghiệp vụ HRM, ví dụ
  tên nhân viên mẫu, tên phòng ban mẫu, loại nghỉ phép mẫu, số ngày công mẫu,
  để việc vẽ giao diện có dữ liệu thực tế thay vì để trống hoặc dùng dữ liệu
  không liên quan tới nhân sự.

Yêu cầu thực thi, chỉ output duy nhất nội dung markdown của file,
không giải thích thêm, không chào hỏi.
```
