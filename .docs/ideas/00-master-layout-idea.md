# Ý tưởng: bố cục toàn cục (Master Layout)

## 1. Thông tin chung
- Dự án: HRM System.
- Tính năng: bộ khung dùng chung cho mọi trang sau khi đăng nhập, gồm sidebar, header, vùng nội dung chính, và một trợ lý AI dạng widget nổi.
- Mục đích: điều hướng nhất quán giữa các module, đồng thời cung cấp sẵn tìm kiếm nhanh, thông báo, và trợ lý AI ở mọi trang.

## 2. Đối tượng và trải nghiệm
- Mọi vai trò sử dụng hệ thống.
- Hành động chính: điều hướng qua sidebar, thu gọn hoặc mở lại sidebar bằng nút hamburger, gõ từ khóa vào ô tìm kiếm rồi nhấn Enter để nhảy thẳng tới trang liên quan, mở bảng thông báo, mở trợ lý AI.
- Cảm xúc mang lại: quen thuộc kiểu dashboard quản trị, thao tác nào cũng nằm trong tầm tay mà không cần rời trang hiện tại.

## 3. Đặc tả thiết kế
- Sidebar rộng cố định, nền trắng, viền phải border-gray-200, gồm logo ở trên cùng, danh sách menu, và khối thông tin người dùng ở dưới cùng.
- Logo là một ô vuông bo góc rounded-lg nền bg-blue-600 chứa chữ viết tắt, cạnh đó là tên hệ thống và dòng mô tả nhỏ.
- Mỗi mục menu có icon và nhãn, mục đang chọn có nền bg-blue-50 chữ text-blue-600, mục chưa chọn chữ text-gray-700, hover đổi nền bg-gray-50. Mục nào có số lượng cần xử lý, ví dụ nghỉ phép đang chờ duyệt, hiện thêm một badge tròn nhỏ màu vàng ở cuối dòng.
- Header dính trên cùng, nền trắng, viền dưới border-gray-200, bên trái gồm nút thu gọn sidebar, ô tìm kiếm, và breadcrumb tên trang hiện tại, bên phải gồm chuông thông báo và ô hiển thị ngày hiện tại.
- Chuông thông báo có chấm đỏ báo số lượng chưa đọc, bấm vào mở bảng danh sách thông báo dạng dropdown, mỗi thông báo có icon tròn màu riêng theo loại sự kiện, dòng chưa đọc có nền xanh nhạt và chấm xanh nhỏ.
- Trợ lý AI là một widget nổi cố định, luôn hiển thị trên mọi trang, không nằm trong luồng cuộn nội dung chính.

## 4. Dữ liệu cốt lõi
- Danh sách menu, mỗi mục gồm đường dẫn, nhãn, icon, và số lượng cần xử lý nếu có.
- Danh sách thông báo, mỗi thông báo gồm loại, tiêu đề, mô tả ngắn, thời gian, trạng thái đã đọc hay chưa.
- Thông tin người dùng đang đăng nhập hiển thị ở cuối sidebar, tên và email.