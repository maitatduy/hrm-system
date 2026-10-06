# Màn hình: đăng nhập

## 1. Thông tin chung

- Dự án: HRM System.
- Tính năng: trang đăng nhập `/login`, đứng độc lập, không nằm trong Master Layout.
- Mục đích: xác thực người dùng bằng email và mật khẩu trước khi vào hệ thống.

## 2. Đối tượng và trải nghiệm

- Người dùng: mọi role.
- Hành động chính: nhập email và mật khẩu, tuỳ chọn ghi nhớ, bấm đăng nhập, hoặc bấm quên mật khẩu.
- Cảm xúc mang lại: tối giản, ít chữ, chỉ có những gì cần để đăng nhập.

## 3. Đặc tả thiết kế

- Card căn giữa màn hình trên nền canvas-soft, chỉ có tiêu đề "Đăng nhập", không logo, không mô tả.
- Hai ô Email và Mật khẩu, không placeholder, không dấu sao bắt buộc.
- Một hàng gồm checkbox ghi nhớ và link "Quên mật khẩu?".
- Nút "Đăng nhập" primary full chiều rộng, khi đang gửi chỉ hiện vòng quay.
- Lỗi đăng nhập hiển thị một banner ngắn phía trên form, dùng nguyên message của backend, không chỉ rõ sai email hay mật khẩu.
- Khi quay về từ luồng khác, hiện một banner thành công ngắn: "Đã đăng xuất", "Đã đặt lại mật khẩu", "Đã đổi mật khẩu, vui lòng đăng nhập lại".

## 4. Dữ liệu cốt lõi

- Email, mật khẩu, ghi nhớ đăng nhập.
- Ghi nhớ bật: giữ đăng nhập 7 ngày kể cả khi đóng mở lại trình duyệt. Access token lưu localStorage, refresh token là cookie lưu bền 7 ngày.
- Ghi nhớ tắt: đóng trình duyệt là phải đăng nhập lại. Access token lưu sessionStorage, refresh token là cookie phiên và tối đa sống 1 ngày ở backend.
- Sau khi đăng nhập, về trang trong tham số `?redirect` nếu là đường dẫn nội bộ an toàn, nếu không thì về trang chủ theo vai trò.
- Người đã đăng nhập vào `/login` sẽ được chuyển đi ngay.
