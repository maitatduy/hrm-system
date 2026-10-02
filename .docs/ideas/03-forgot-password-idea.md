# Màn hình: quên mật khẩu

## 1. Thông tin chung

- Dự án: HRM System.
- Tính năng: form nhập email để nhận mã OTP đặt lại mật khẩu.
- Mục đích: cho phép người dùng tự khôi phục quyền truy cập khi quên mật khẩu, không cần nhờ Admin can thiệp thủ công.

## 2. Đối tượng và trải nghiệm

- Người dùng: mọi role.
- Hành động chính: nhập email, bấm gửi mã, được chuyển sang màn hình nhập OTP.
- Cảm xúc mang lại: yên tâm, biết rõ bước tiếp theo cần làm gì.

## 3. Đặc tả thiết kế

- Dùng chung AuthCardLayout với màn đăng nhập, chỉ có một field email và một nút gửi mã.
- Có link quay lại trang đăng nhập.
- Thông báo sau khi gửi luôn dùng câu chung chung, ví dụ nếu email tồn tại trong hệ thống, mã xác thực đã được gửi, để tránh lộ thông tin email nào đang tồn tại.

## 4. Dữ liệu cốt lõi

- Email.
- Thông báo kết quả gửi mã, dạng chung chung như đã nêu ở trên.