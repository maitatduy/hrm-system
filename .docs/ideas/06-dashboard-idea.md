# Màn hình: tổng quan (Dashboard)

## 1. Thông tin chung
- Dự án: HRM System.
- Tính năng: trang đầu tiên sau khi đăng nhập, tổng hợp số liệu nhân sự ở mức toàn công ty.
- Mục đích: cho cái nhìn nhanh về tình hình nhân sự, chấm công, nghỉ phép và tuyển dụng mà không cần vào từng module.

## 2. Đối tượng và trải nghiệm
- Admin và HR.
- Hành động chính: xem nhanh số liệu tổng quan, xem biểu đồ, xem hoạt động gần đây và sự kiện sắp tới, không có thao tác nhập liệu trên trang này.
- Cảm xúc mang lại: nắm bắt tình hình công ty ngay khi mở hệ thống.

## 3. Đặc tả thiết kế
- Bốn thẻ thống kê trên cùng, tổng nhân viên, số người đi làm hôm nay, số người đang nghỉ phép, số vị trí đang tuyển, mỗi thẻ có icon và chỉ số tăng giảm so với tháng trước.
- Hàng biểu đồ gồm hai card ngang nhau, biểu đồ đường thể hiện tỷ lệ chuyên cần sáu tháng gần nhất, biểu đồ tròn thể hiện phân bổ nhân viên theo phòng ban.
- Hàng dưới cùng chia ba cột, hai cột bên trái là danh sách hoạt động gần đây dạng từng dòng có icon avatar, cột bên phải là danh sách sự kiện sắp tới dạng card nhỏ có ngày giờ.

## 4. Dữ liệu cốt lõi
- Bốn chỉ số thống kê kèm phần trăm thay đổi.
- Dữ liệu biểu đồ chuyên cần theo tháng, dữ liệu phân bổ nhân viên theo phòng ban kèm màu riêng từng phòng ban.
- Danh sách hoạt động gần đây, mỗi hoạt động gồm tên nhân viên, hành động, phòng ban, thời gian.
- Danh sách sự kiện sắp tới, mỗi sự kiện gồm tiêu đề, ngày, giờ, loại sự kiện.
