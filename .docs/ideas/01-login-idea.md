# Màn hình: đăng nhập

## 1. Thông tin chung

- Dự án: HRM System.
- Tính năng: trang đăng nhập, đứng độc lập, không nằm trong Master Layout vì người dùng chưa xác thực.
- Mục đích: xác thực người dùng bằng email và mật khẩu trước khi vào hệ thống.

## 2. Đối tượng và trải nghiệm

- Người dùng: mọi role.
- Hành động chính: nhập email và mật khẩu, tuỳ chọn ghi nhớ đăng nhập, bấm đăng nhập, hoặc bấm link quên mật khẩu.
- Cảm xúc mang lại: đơn giản, đáng tin cậy, thông báo lỗi rõ ràng nhưng không tiết lộ email nào tồn tại trong hệ thống.

## 3. Đặc tả thiết kế

- Card đăng nhập căn giữa màn hình, nền canvas-soft phủ toàn trang phía sau.
- Logo công ty phía trên form, tiêu đề ngắn gọn.
- Input dùng rounded-xs theo DESIGN.md, nút đăng nhập primary, full chiều rộng card.
- Lỗi sai email hoặc mật khẩu hiển thị chung một thông báo dưới form bằng accent-danger, không chỉ rõ sai ở trường nào để tránh dò tài khoản.
- Link quên mật khẩu đặt ngay dưới ô mật khẩu.

## 4. Dữ liệu cốt lõi

- Email, mật khẩu, checkbox ghi nhớ đăng nhập.
- Sau khi đăng nhập thành công, điều hướng theo role, ví dụ ADMIN và HR vào dashboard quản trị, EMPLOYEE vào dashboard cá nhân.
