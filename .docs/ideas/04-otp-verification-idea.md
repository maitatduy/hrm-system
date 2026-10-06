# Màn hình: nhập mã OTP

## 1. Thông tin chung

- Dự án: HRM System.
- Tính năng: trang `/verify-otp?email=...`, xác thực mã OTP sáu số trong luồng quên mật khẩu.
- Mục đích: xác minh đúng người sở hữu email trước khi cho đặt lại mật khẩu.

## 2. Đối tượng và trải nghiệm

- Người dùng: mọi role, đang trong luồng quên mật khẩu.
- Hành động chính: nhập sáu ô số, con trỏ tự sang ô kế tiếp, có thể dán cả mã, bấm "Xác nhận". Hết đếm ngược thì gửi lại mã.
- Cảm xúc mang lại: rõ mã gửi tới đâu, rõ khi nào được gửi lại.

## 3. Đặc tả thiết kế

- Tiêu đề "Nhập mã OTP", dưới là một dòng "Đã gửi tới ng***a@hrm.vn" với email đã che bớt.
- Sáu ô vuông bo góc rounded-xs, ô đang nhập viền primary, khi mã sai cả sáu ô viền accent-danger.
- Nút "Xác nhận" primary full chiều rộng.
- Nút chữ "Gửi lại mã sau 00:59" ở trạng thái vô hiệu, hết giờ đổi thành "Gửi lại mã" màu primary.
- Link "Quay lại đăng nhập" ở cuối.

## 4. Dữ liệu cốt lõi

- Mã OTP sáu số, email lấy từ URL. Thiếu email thì quay về màn quên mật khẩu.
- Đếm ngược gửi lại 60 giây, khớp giới hạn của backend.
- Xác thực thành công thì chuyển sang màn đặt lại mật khẩu, reset token truyền qua history state, không đặt trên URL.
- Backend hủy mã sau 5 lần nhập sai.
