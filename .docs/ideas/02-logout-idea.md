# Hành động: đăng xuất

## 1. Thông tin chung

- Dự án: HRM System.
- Tính năng: đăng xuất từ menu tài khoản trên header, không phải một trang riêng.
- Mục đích: kết thúc phiên, đưa access token vào blacklist trên Redis và xóa refresh token, theo `.docs/ARCHITECTURE.md`.

## 2. Đối tượng và trải nghiệm

- Người dùng: mọi role.
- Hành động chính: bấm ảnh đại diện, chọn "Đăng xuất", xác nhận trong hộp thoại, về trang đăng nhập.
- Cảm xúc mang lại: nhanh gọn, có một bước xác nhận để tránh bấm nhầm.

## 3. Đặc tả thiết kế

- Menu tài khoản gồm email và vai trò ở đầu, mục "Đổi mật khẩu" và mục "Đăng xuất" chữ màu accent-danger. Không icon.
- Hộp thoại xác nhận nhỏ, chỉ có tiêu đề "Đăng xuất?", nút "Hủy" secondary và nút "Đăng xuất" accent-danger. Không mô tả, không icon.
- Nhấn Esc hoặc bấm ra ngoài để đóng menu và hộp thoại.
- Sau khi đăng xuất, trang đăng nhập hiện banner "Đã đăng xuất".

## 4. Dữ liệu cốt lõi

- Không có dữ liệu nhập.
- Phiên ở frontend luôn được xóa kể cả khi API đăng xuất lỗi, ví dụ access token đã hết hạn.
