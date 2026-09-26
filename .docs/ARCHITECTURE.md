# Kiến trúc hệ thống: HRM System

## 1. Sơ đồ dữ liệu cốt lõi theo từng service

Mỗi service sở hữu database riêng, không service nào được đọc trực tiếp bảng của service khác.

- **employee-service**
  - `Employee`: thông tin nhân viên, `departmentId`, `positionId`, `status` (đang làm việc, đã nghỉ việc...), ngày vào làm.
  - `Department`: phòng ban, hỗ trợ cấu trúc cây parent-child (phòng ban con).
  - `Position`: chức vụ, gắn với `baseSalaryGrade` để payroll-service tham chiếu qua API, không lưu lương trực tiếp ở đây.

- **attendance-service**
  - `AttendanceRecord`: bản ghi chấm công theo ngày, `checkInTime`, `checkOutTime`, `status` (đúng giờ, đi trễ, vắng mặt).
  - `Shift`: ca làm việc, khung giờ chuẩn để đối chiếu tính công muộn hoặc về sớm.

- **leave-service**
  - `LeaveRequest`: đơn xin nghỉ phép, `type`, `fromDate`, `toDate`, `status` (chờ duyệt, đã duyệt, từ chối).
  - `LeaveType`: loại nghỉ phép (phép năm, ốm, không lương...), số ngày tối đa theo chính sách.
  - `LeaveBalance`: số ngày phép còn lại của từng nhân viên theo năm.

- **payroll-service**
  - `Payroll`: kỳ lương, trạng thái xử lý (đang tính, đã chốt, đã trả).
  - `Payslip`: phiếu lương từng nhân viên trong một kỳ lương. Đây là dữ liệu **snapshot bất biến** tại thời điểm chốt lương, giống nguyên tắc `OrderItem` trong e-commerce, lưu cứng lương cơ bản, phụ cấp, số ngày công, số ngày nghỉ không lương tại thời điểm đó — không tham chiếu lại dữ liệu hiện tại của employee-service hay attendance-service.
  - `SalaryComponent`: các thành phần lương, lương cơ bản, phụ cấp, khấu trừ.

- **auth-service**
  - `User`: tài khoản đăng nhập, liên kết `employeeId`.
  - `Role`: vai trò, một user có thể có một hoặc nhiều role.
  - Refresh token không lưu ở database quan hệ, lưu trong Redis, nêu chi tiết ở mục 4.

## 2. Luồng nghiệp vụ quan trọng

### Chấm công

- Nhân viên check-in, check-out qua attendance-service, hệ thống tự tính giờ làm thực tế dựa trên `Shift` được gán.
- Đi trễ hoặc về sớm quá số phút cho phép sẽ đánh dấu `status` bất thường, dữ liệu này payroll-service sẽ đọc khi tính lương.

### Nghỉ phép và ảnh hưởng tới lương

- Nhân viên tạo `LeaveRequest`, trạng thái mặc định `PENDING`.
- Khi `MANAGER` duyệt đơn, leave-service publish event `hrm.leave.approved` lên Kafka.
- payroll-service subscribe event này để biết số ngày nghỉ không lương của nhân viên trong kỳ, không gọi ngược lại leave-service theo kiểu đồng bộ cho nghiệp vụ này.
- `LeaveBalance` bị trừ ngay khi đơn được duyệt, không chờ tới kỳ tính lương.

### Tính lương

- payroll-service tổng hợp dữ liệu từ employee-service, qua vị trí, và attendance-service, qua ngày công, bằng OpenFeign vì cần dữ liệu ngay khi bắt đầu chạy một kỳ lương.
- Dữ liệu nghỉ phép lấy qua event đã lưu sẵn từ bước trên, không gọi đồng bộ sang leave-service.
- Mọi phép tính tiền, lương cơ bản, phụ cấp, khấu trừ, thuế thu nhập cá nhân, bắt buộc thực hiện ở backend trong payroll-service.
- Tuyệt đối không tin tưởng bất kỳ số liệu lương nào gửi lên từ frontend, kể cả khi HR chỉnh sửa thủ công, frontend chỉ gửi `employeeId` và các điều chỉnh dạng đề xuất, backend tự tính lại toàn bộ.
- Sau khi kỳ lương được chốt, `Payslip` trở thành bất biến, mọi điều chỉnh sau đó phải tạo một bản ghi điều chỉnh mới, không sửa trực tiếp lên bản ghi cũ.

## 3. Quy chuẩn API

- Mọi API trả về danh sách, ví dụ danh sách nhân viên hoặc danh sách đơn nghỉ phép, bắt buộc phải có phân trang gồm `page`, `limit`, `totalPages`.
- API tạo mới có ảnh hưởng tài chính hoặc dữ liệu nhạy cảm, tạo đơn nghỉ phép, chạy kỳ lương, bắt buộc có rate limit để chống spam hoặc thao tác nhầm hàng loạt.
- API của payroll-service chỉ cho phép role `ADMIN` và `HR` gọi tới, kiểm tra ở cả api-gateway lẫn chính service.

## 4. Module Auth, xác thực, phân quyền và bảo mật

### 4.1. Tổng quan nghiệp vụ

- Hệ thống dùng JWT kết hợp Redis để quản lý phiên đăng nhập theo thời gian thực.
- Redis dùng để thu hồi quyền truy cập ngay lập tức khi phát hiện rủi ro, và chặn các phiên đăng nhập sau khi người dùng đã đăng xuất.

### 4.2. Định nghĩa vai trò

- `ADMIN`: toàn quyền quản trị, truy cập mọi dashboard, duyệt tài khoản mới, thu hồi quyền của bất kỳ ai.
- `HR`: quản lý nhân sự và lương, xem và chỉnh sửa thông tin nhân viên, chạy và duyệt kỳ lương, không có quyền cấu hình hệ thống.
- `MANAGER`: quản lý trực tiếp một nhóm nhân viên, duyệt đơn nghỉ phép của nhân viên thuộc quyền quản lý, xem chấm công của nhóm mình.
- `EMPLOYEE`: nhân viên thường, chỉ xem và thao tác trên dữ liệu của chính mình, tạo đơn nghỉ phép, xem bảng lương của mình, xem lịch sử chấm công của mình.

### 4.3. Chiến lược refresh token rotation

- Luồng chuẩn, khi access token hết hạn sau 15 phút, client tự động gọi API refresh token kèm `REFRESH_TOKEN_A`. Hệ thống xác thực token này trong Redis, xóa `REFRESH_TOKEN_A`, sinh ra `REFRESH_TOKEN_B` cùng `ACCESS_TOKEN` mới, trả về cho client.
- Kịch bản tấn công replay attack, nếu kẻ tấn công lấy được `REFRESH_TOKEN_A` và cố dùng lại trong khi client thật đã đổi sang `REFRESH_TOKEN_B`, hệ thống kiểm tra Redis sẽ thấy `REFRESH_TOKEN_A` không còn tồn tại hoặc đã bị đánh dấu sử dụng.
- Hành động bắt buộc trong trường hợp này, phát cảnh báo bảo mật, xóa toàn bộ refresh token của `userId` đó trong Redis, ép tất cả thiết bị đang đăng nhập phải xác thực lại từ đầu.

### 4.4. Chiến lược đăng xuất

- Khi người dùng đăng xuất, refresh token hiện tại bị xóa khỏi Redis ngay lập tức.
- Access token hiện tại, dù còn hạn, phải được đưa vào danh sách blacklist trên Redis, thời gian tồn tại trong blacklist bằng đúng thời gian còn lại của token đó, tránh làm tràn bộ nhớ Redis theo thời gian.

## 5. Ghi chú

Tài liệu này mô tả kiến trúc mức nghiệp vụ để agent tham chiếu khi sinh code, không phải tài liệu đặc tả kỹ thuật đầy đủ. Khi thiết kế thêm module mới hoặc thay đổi luồng nghiệp vụ hiện có, cập nhật file này song song với code để `GEMINI.md` luôn đọc được thông tin mới nhất ở đầu mỗi phiên.
