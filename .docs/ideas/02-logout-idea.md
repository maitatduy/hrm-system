# Hành động: đăng xuất

## 1. Thông tin chung

- Dự án: HRM System.
- Tính năng: hành động đăng xuất, kích hoạt từ mục trong UserMenuDropdown ở header, không phải một trang riêng.
- Mục đích: kết thúc phiên đăng nhập, đưa access token vào blacklist trên Redis và xóa refresh token, đúng theo chiến lược đã mô tả trong .docs/ARCHITECTURE.md.

## 2. Đối tượng và trải nghiệm

- Người dùng: mọi role.
- Hành động chính: bấm mục đăng xuất trong menu tài khoản, xác nhận trong hộp thoại nhỏ, hệ thống điều hướng về trang đăng nhập.
- Cảm xúc mang lại: nhanh gọn, nhưng vẫn có một bước xác nhận để tránh bấm nhầm giữa lúc thao tác nhanh.

## 3. Đặc tả thiết kế

- Dùng modal xác nhận nhỏ, căn giữa màn hình, nền phủ mờ phía sau.
- Nút xác nhận đăng xuất dùng accent-danger vì đây là hành động chấm dứt phiên làm việc.
- Nút hủy dùng secondary, nền trắng viền hairline.

## 4. Dữ liệu cốt lõi

- Không cần dữ liệu nhập, chỉ cần xác nhận có hay không thực hiện hành động.