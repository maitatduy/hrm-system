# Ý tưởng: bố cục toàn cục (Master Layout)

## 1. Thông tin chung

- Dự án: HRM System.
- Tính năng: khung dùng chung cho mọi trang sau khi đăng nhập, gồm header, sidebar và vùng nội dung chính.
- Mục đích: điều hướng nhất quán giữa các module với giao diện tối giản, ít chữ, không logo.

## 2. Đối tượng và trải nghiệm

- Mọi vai trò sử dụng hệ thống.
- Hành động chính: bấm tên hệ thống để về trang chủ theo vai trò, chọn mục trên sidebar, bấm ảnh đại diện để mở menu tài khoản.
- Cảm xúc mang lại: gọn gàng, chỉ thấy những gì đang dùng được.

## 3. Đặc tả thiết kế

- Header cố định trên cùng: bên trái chữ "HRM System", bên phải ảnh đại diện tròn chứa hai chữ cái đầu của email.
- Sidebar cố định bên trái trên màn hình từ md trở lên, chỉ liệt kê các mục đã có trang. Mục đang chọn nền primary nhạt, chữ primary.
- Không hiển thị mục chưa có chức năng, không icon trang trí, không logo.
- Trang tổng quan hiện tại chỉ có tiêu đề, sẽ thay bằng dashboard thật khi các module hoàn thành.

## 4. Dữ liệu cốt lõi

- Vai trò người dùng để tính trang chủ: ADMIN và HR vào `/dashboard`, MANAGER vào `/management/dashboard`, EMPLOYEE vào `/portal/dashboard`.
- Danh sách mục sidebar: Tổng quan (trang chủ theo vai trò), Cài đặt (`/settings`).

## 5. Chưa triển khai

- Ô tìm kiếm nhanh, breadcrumb, chuông thông báo, ô ngày hiện tại trên header.
- Thu gọn sidebar, badge số lượng cần xử lý trên từng mục menu.
- Trợ lý AI dạng widget nổi.
- Menu các module nhân viên, chấm công, nghỉ phép, bảng lương, sẽ thêm vào sidebar khi từng module có trang.
