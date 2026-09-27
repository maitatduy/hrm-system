# Luật thiết kế: HRM System

Tài liệu này dựa trên bộ design token đã phân tích từ Notion, gồm màu sắc, typography, bo góc và spacing, áp dụng lại cho các màn hình nghiệp vụ HRM.

## Bảng màu và phân cấp

- Primary action, mã màu #0075de, trạng thái nhấn dùng #005bab. Dùng duy nhất cho nút hành động chính như lưu nhân viên, duyệt đơn nghỉ phép, chốt kỳ lương. Không dùng màu này cho phần trang trí hay icon phụ.
- Secondary action, nền trắng #ffffff, chữ đen #000000, viền hairline #e6e6e6. Dùng cho nút phụ như xem chi tiết, hủy, quay lại.
- Nền trang dùng canvas-soft #f6f5f4, card và input dùng surface trắng #ffffff để nổi bật trên nền.
- Chữ chính dùng ink #000000, chữ phụ dùng ink-secondary #31302e, chữ mờ dùng ink-muted #615d59 hoặc ink-faint #a39e98 cho ghi chú ít quan trọng.
- Trạng thái thành công, ví dụ đơn đã duyệt hoặc nhân viên đang làm việc, dùng accent-green #1aae39.
- Trạng thái đang chờ, ví dụ đơn chờ duyệt hoặc lương đang xử lý, dùng accent-orange #dd5b00.
- Bộ token gốc không có màu đỏ semantic cho hành động nguy hiểm hoặc từ chối, đề xuất bổ sung accent-danger #dc2626 riêng cho HRM, dùng cho nút từ chối đơn, xóa nhân viên, hoặc badge đã nghỉ việc.

## Typography và khoảng cách

- Tiêu đề trang dùng heading-1, cỡ 40px, đậm 700.
- Tiêu đề khối hoặc card dùng heading-3, cỡ 22px, đậm 700.
- Nội dung chính dùng body-md, cỡ 16px, đậm 400, không đặt nội dung dài ở weight đậm.
- Label bảng, badge nhỏ, ghi chú dùng caption hoặc eyebrow, cỡ 12 tới 14px.
- Bo góc dùng đúng thang token, rounded-xs 4px cho input, rounded-md 8px cho nút phụ và card nhỏ, rounded-lg 12px cho card lớn, rounded-full cho nút chính và badge dạng pill.
- Khoảng cách trong card giữ ở mức spacing-lg 24px, khoảng cách giữa các trường trong form giữ ở mức spacing-sm tới spacing-md.

## Thành phần đặc thù HRM

- Employee card, ảnh đại diện hình vuông bo tròn đầy đủ, tên dùng typography title, phòng ban và chức vụ dùng body-sm với màu ink-muted. Badge trạng thái đặt ở góc trên bên phải card.
- Badge trạng thái nhân viên, đang làm việc dùng accent-green, đang nghỉ phép dùng accent-orange, đã nghỉ việc dùng ink-faint làm nền xám, không dùng accent-danger cho trạng thái này vì đây không phải hành động cần cảnh báo.
- Badge trạng thái đơn nghỉ phép, chờ duyệt dùng accent-orange, đã duyệt dùng accent-green, từ chối dùng accent-danger.
- Bảng lương, số tiền thực nhận dùng ink đậm và cỡ chữ lớn hơn dòng còn lại, các khoản khấu trừ dùng ink-muted kèm dấu trừ phía trước, không dùng gạch ngang giữa chữ như giá cũ trong e-commerce vì đây là số liệu tài chính cần đọc rõ ràng.
- Bảng dữ liệu, header dùng typography eyebrow viết hoa nhẹ, phần thân dùng body-sm, mỗi dòng có hairline phân cách, không dùng viền đậm.
- Layout danh sách nhân viên, desktop dùng dạng bảng có phân trang, tablet trở xuống chuyển sang dạng card xếp chồng một cột, không dùng lưới nhiều cột như grid sản phẩm vì dữ liệu nhân sự cần đọc theo hàng ngang nhiều hơn.

## Ràng buộc trải nghiệm người dùng

- Duyệt đơn nghỉ phép, khi bấm vào một dòng trong danh sách đơn, mở drawer trượt từ phải sang để xem chi tiết và duyệt, không chuyển sang trang mới để giữ mạch làm việc của HR hoặc Manager.
- Phản hồi hành động, khi duyệt hoặc từ chối đơn, khi lưu thông tin nhân viên, khi chốt kỳ lương thành công, hiển thị toast góc trên bên phải báo kết quả.
- Hành động nguy hiểm, xóa nhân viên hoặc hủy một kỳ lương đã chốt, bắt buộc hiển thị modal xác nhận trước khi thực hiện, nút xác nhận dùng màu accent-danger thay vì primary.
- Form nhập liệu, input giữ góc vuông nhẹ rounded-xs, không dùng bo tròn pill như nút, trường bắt buộc hiển thị lỗi ngay dưới input khi validate thất bại.
- Điều hướng chính, sidebar bên trái dùng surface trắng, mục đang chọn dùng primary color làm thanh chỉ báo bên trái, không dùng nền đổi màu toàn bộ hàng.

## Nên và không nên

- Chỉ dùng primary color cho hành động chính và trạng thái đang chọn, không dùng cho trang trí.
- Giữ nền trang canvas-soft, card và input dùng surface trắng để tạo phân lớp rõ ràng.
- Dùng shadow nhiều lớp mờ nhẹ thay vì đổ bóng nặng, ưu tiên hairline cho card mặc định.
- Không đặt nội dung dài ở weight chữ đậm, giữ weight 400 cho phần đọc chính, weight 700 chỉ dùng cho tiêu đề.
- Không dùng accent-danger cho trạng thái trung tính như đã nghỉ việc, chỉ dùng cho hành động cần cảnh báo thật sự.
- Không trộn nhiều bo góc khác nhau trong cùng một nhóm thành phần cùng cấp, ví dụ các nút trong cùng một form nên dùng chung một mức bo góc.
