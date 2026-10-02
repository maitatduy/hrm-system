# Màn hình: nhập mã OTP

## 1. Thông tin chung

- Dự án: HRM System.
- Tính năng: xác thực mã OTP sáu số gửi qua email trong luồng quên mật khẩu.
- Mục đích: xác minh đúng người sở hữu email trước khi cho phép đặt lại mật khẩu.

## 2. Đối tượng và trải nghiệm

- Người dùng: mọi role, đang trong luồng quên mật khẩu.
- Hành động chính: nhập sáu ô số OTP, con trỏ tự chuyển sang ô tiếp theo khi gõ, bấm xác nhận, có nút gửi lại mã sau khi hết thời gian đếm ngược.
- Cảm xúc mang lại: rõ ràng thời gian còn hiệu lực của mã, không bị bối rối khi nhập.

## 3. Đặc tả thiết kế

- Sáu ô input vuông cạnh nhau, bo góc rounded-xs, viền chuyển sang primary khi đang focus.
- Nút xác nhận primary, full chiều rộng card, nằm dưới các ô OTP.
- Đếm ngược thời gian gửi lại mã hiển thị dạng chữ nhỏ màu ink-muted, khi hết thời gian tự đổi thành link gửi lại mã màu primary.
- Hiển thị email đã che bớt phía trên, ví dụ ng**@company.com, để người dùng biết mã gửi tới đâu mà không lộ toàn bộ email.

## 4. Dữ liệu cốt lõi

- Mã OTP sáu số.
- Email đã nhập ở bước trước, dùng để gửi kèm khi xác thực.
- Thời gian còn hiệu lực để tính đếm ngược gửi lại mã.