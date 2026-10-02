# Màn hình: đổi mật khẩu

## 1. Thông tin chung

- Dự án: HRM System.
- Tính năng: form nhập mật khẩu mới, dùng chung cho hai ngữ cảnh, đặt lại mật khẩu sau khi xác thực OTP thành công, và tự đổi mật khẩu khi đã đăng nhập trong trang cài đặt tài khoản.
- Mục đích: giữ một giao diện và một bộ quy tắc nhất quán cho mọi luồng liên quan tới mật khẩu, tránh viết hai form riêng biệt cho cùng một việc.

## 2. Đối tượng và trải nghiệm

- Người dùng: mọi role.
- Hành động chính: nhập mật khẩu hiện tại, chỉ hiển thị khi tự đổi lúc đã đăng nhập, nhập mật khẩu mới, xác nhận lại mật khẩu mới, bấm lưu.
- Cảm xúc mang lại: an tâm về độ an toàn, thấy ngay yêu cầu độ mạnh mật khẩu trong lúc gõ thay vì chỉ báo lỗi sau khi bấm lưu.

## 3. Đặc tả thiết kế

- Ở ngữ cảnh đặt lại sau OTP, hiển thị trong AuthCardLayout giống các màn hình chưa đăng nhập khác.
- Ở ngữ cảnh tự đổi khi đã đăng nhập, hiển thị dạng một section trong trang cài đặt tài khoản, nằm trong Master Layout.
- Danh sách điều kiện độ mạnh mật khẩu hiển thị ngay dưới ô mật khẩu mới, ví dụ tối thiểu tám ký tự, có chữ hoa, có số, mỗi điều kiện chuyển màu accent-green khi đã đạt.
- Nút lưu dùng primary, disable khi mật khẩu mới và xác nhận chưa khớp hoặc chưa đạt đủ điều kiện.

## 4. Dữ liệu cốt lõi

- Mật khẩu hiện tại, chỉ bắt buộc ở ngữ cảnh tự đổi khi đã đăng nhập.
- Mật khẩu mới, xác nhận mật khẩu mới.
- Danh sách điều kiện độ mạnh mật khẩu và trạng thái đạt hay chưa của từng điều kiện.