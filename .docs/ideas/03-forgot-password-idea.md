# Màn hình: quên mật khẩu

## 1. Thông tin chung

- Dự án: HRM System.
- Tính năng: trang `/forgot-password`, nhập email để nhận mã OTP đặt lại mật khẩu.
- Mục đích: người dùng tự khôi phục quyền truy cập, không cần Admin can thiệp.

## 2. Đối tượng và trải nghiệm

- Người dùng: mọi role.
- Hành động chính: nhập email, bấm "Gửi mã", được chuyển ngay sang màn nhập OTP.
- Cảm xúc mang lại: một bước, không chữ thừa.

## 3. Đặc tả thiết kế

- Dùng chung card với màn đăng nhập, chỉ có tiêu đề "Quên mật khẩu", ô Email, nút "Gửi mã" và link "Quay lại đăng nhập".
- Không mô tả, không banner thông báo thành công, gửi xong chuyển trang luôn.
- Lỗi hiển thị một banner ngắn, ví dụ khi gửi lại quá nhanh thì dùng message giới hạn 60 giây của backend.

## 4. Dữ liệu cốt lõi

- Email, có thể điền sẵn từ tham số `?email`.
- Backend luôn trả cùng một kết quả dù email có tồn tại hay không, để không lộ thông tin tài khoản.
