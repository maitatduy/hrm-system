# Ý tưởng: bố cục toàn cục (Master Layout)

## 1. Thông tin chung

- Dự án: HRM System.
- Tính năng: bộ khung dùng chung cho mọi trang sau khi đăng nhập, gồm header, sidebar, vùng nội dung chính và footer.
- Mục đích: đảm bảo điều hướng nhất quán giữa các module employee, attendance, leave, payroll, tự động ẩn hiện menu theo đúng role đang đăng nhập.

## 2. Đối tượng và trải nghiệm

- Người dùng: mọi role, ADMIN, HR, MANAGER, EMPLOYEE, mỗi role thấy menu sidebar khác nhau.
- Hành động chính: điều hướng giữa các module qua sidebar, xem thông báo qua header, mở menu tài khoản để đổi mật khẩu hoặc đăng xuất.
- Cảm xúc mang lại: gọn gàng, quen thuộc kiểu dashboard quản trị, không cần học lại cách dùng khi chuyển module.

## 3. Đặc tả thiết kế

- Header dính cố định trên cùng, nền trắng, bên trái là logo công ty, bên phải là icon thông báo và avatar kèm tên người dùng mở dropdown.
- Sidebar cố định bên trái, nền trắng, danh sách menu theo icon và label, mục đang chọn có thanh chỉ báo màu primary bên trái, không đổi nền toàn hàng.
- Vùng nội dung chính nằm bên phải sidebar, nền canvas-soft, có padding hai bên cho thoáng.
- Footer đơn giản, chỉ hiển thị tên hệ thống và số phiên bản, không cần nhiều cột như trang thương mại điện tử vì đây là ứng dụng nội bộ.
- Trên mobile, sidebar thu gọn thành menu ẩn hiện qua nút hamburger ở header.

## 4. Dữ liệu cốt lõi

- Danh sách menu sidebar, mỗi mục gồm tên, icon, đường dẫn, danh sách role được phép thấy.
- Thông tin người dùng đang đăng nhập, tên, avatar, role.
- Số lượng thông báo chưa đọc hiển thị trên icon chuông.
