# Màn hình: đặt lại và đổi mật khẩu

## 1. Thông tin chung

- Dự án: HRM System.
- Tính năng: một form mật khẩu dùng cho hai ngữ cảnh, đặt lại mật khẩu sau OTP tại `/reset-password`, và tự đổi mật khẩu trong trang `/settings`.
- Mục đích: một giao diện và một bộ quy tắc mật khẩu cho mọi luồng.

## 2. Đối tượng và trải nghiệm

- Người dùng: mọi role.
- Hành động chính: nhập mật khẩu hiện tại (chỉ khi tự đổi), nhập mật khẩu mới, nhập lại, bấm lưu.
- Cảm xúc mang lại: gọn, chỉ báo lỗi khi cần.

## 3. Đặc tả thiết kế

- Đặt lại: card giống màn đăng nhập, tiêu đề "Đặt lại mật khẩu", ô "Mật khẩu mới", "Nhập lại mật khẩu", nút "Lưu mật khẩu" full chiều rộng.
- Đổi: một card "Đổi mật khẩu" trong trang Cài đặt, thêm ô "Mật khẩu hiện tại", nút "Đổi mật khẩu" căn phải.
- Không placeholder, không danh sách yêu cầu độ mạnh. Quy tắc chỉ hiện thành một dòng lỗi dưới ô khi chưa đạt.
- Nút lưu bị vô hiệu cho tới khi form hợp lệ.

## 4. Dữ liệu cốt lõi

- Mật khẩu mới: tối thiểu 8 ký tự, tối đa 100, gồm chữ hoa, chữ thường, số và ký tự đặc biệt. Đổi mật khẩu thì phải khác mật khẩu hiện tại.
- Đặt lại thành công: về trang đăng nhập với banner "Đã đặt lại mật khẩu".
- Đổi thành công: backend thu hồi mọi refresh token nên frontend đăng xuất luôn, trang đăng nhập hiện "Đã đổi mật khẩu, vui lòng đăng nhập lại".
