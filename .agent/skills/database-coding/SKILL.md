---
name: database-coding
description: Chuyển đổi trụ cột thiết kế dữ liệu trong BACKEND_PLAN.md thành entity JPA và Flyway migration SQL thực tế, ghi trực tiếp vào đúng service trong dự án, tuân thủ chuẩn Enterprise với Spring Boot 3 và MySQL. Dùng khi người dùng yêu cầu code database, viết schema, hoặc tạo entity từ backend plan.
triggers:
  - "/database-coding"
  - "viết schema"
---

# Nhiệm vụ: Database Administrator và thực thi file

Khi nhận lệnh kèm đường dẫn một file backend plan, đóng vai trò Database Administrator cấp cao cho hệ thống HRM microservices. Đọc trụ cột 1, thiết kế dữ liệu, trong bản kế hoạch, và trực tiếp ghi ra file vật lý trong đúng service, không chỉ in code ra màn hình chat.

## Bước 1: nạp ngữ cảnh và xác định vị trí file

- Đọc AGENTS.md và .agent/rules/backend-standards.md để xác nhận project dùng Spring Boot 3, Spring Data JPA, MySQL, và Flyway để quản lý migration, không dùng Prisma hay TypeORM.
- Xác định đúng service sở hữu bảng dữ liệu này, đã được ghi rõ trong backend plan, mỗi service có database riêng.
- Entity Java đặt tại backend/[tên-service]/src/main/java/com/company/hrm/[tên-service]/entity/.
- File migration SQL đặt tại backend/[tên-service]/src/main/resources/db/migration/, đặt tên theo đúng chuẩn Flyway, chữ V, số thứ tự tăng dần, hai gạch dưới, mô tả ngắn gọn bằng snake_case, ví dụ V5__create_leave_requests_table.sql. Xem số lớn nhất đang có trong thư mục đó để chọn số tiếp theo, không trùng số đã dùng.

## Bước 2: quy tắc đặt tên

- Tên entity Java, PascalCase, số ít, ví dụ Employee, LeaveRequest.
- Tên trường trong entity, camelCase, ví dụ createdAt, totalDays.
- Tên bảng trong SQL, snake_case, số nhiều, ví dụ employees, leave_requests, khai báo tường minh bằng @Table name trong entity, không phụ thuộc vào quy ước tự sinh của Hibernate.
- Khóa chính dùng kiểu UUID, tự sinh bằng @GeneratedValue, đúng theo quy ước id UUID đã có trong backend-standards.md.
- Mọi entity có đủ bốn cột audit, createdAt, updatedAt, createdBy, updatedBy, đúng theo quy ước chung.

## Bước 3: ràng buộc và quan hệ

- Quan hệ một nhiều hoặc nhiều nhiều trong cùng một service, định nghĩa rõ bằng @ManyToOne, @OneToMany, hoặc @ManyToMany kèm @JoinColumn, khóa ngoại khai báo tường minh trong migration SQL.
- Tuyệt đối không tạo khóa ngoại hoặc quan hệ JPA trỏ sang bảng ở database của service khác, vì mỗi service có database riêng biệt. Dữ liệu tham chiếu tới service khác chỉ lưu dưới dạng một cột UUID thường, đặt tên kết thúc bằng Id, ví dụ employeeId, không đánh dấu là quan hệ JPA.
- Xử lý hành vi xóa, dùng soft delete với cột deletedAt cho dữ liệu quan trọng không nên mất vĩnh viễn, ví dụ nhân viên, đơn nghỉ phép, phiếu lương. Dùng cascade xóa thật cho dữ liệu phụ thuộc không có giá trị độc lập, ví dụ dòng chi tiết thuộc về một bản ghi cha trong cùng service.

## Bước 4: tối ưu hiệu suất

- Đánh index cho các cột thường dùng để tìm kiếm hoặc lọc, ví dụ cột trạng thái, cột ngày tháng, khai báo trong migration SQL bằng CREATE INDEX, đồng thời khai báo lại trong entity bằng @Table indexes để Hibernate nhận biết đúng khi validate schema.
- Đánh unique index cho các cột không được trùng lặp, ví dụ email trong bảng tài khoản.

## Bước 5: thực thi ghi file, bắt buộc

- Không được chỉ in code ra màn hình chat.
- Bắt buộc tạo mới hoặc cập nhật file migration SQL và file entity Java tương ứng, ghi trực tiếp vào đúng đường dẫn đã xác định ở bước 1.
- Nếu entity đã tồn tại, chỉ thêm hoặc sửa đúng phần liên quan tới module đang xử lý, tuyệt đối không làm hỏng hoặc xóa mất các entity, bảng, hoặc cột khác đã tồn tại trước đó.
- Không sửa lại một file migration đã từng chạy, nếu cần thay đổi bảng đã tồn tại, tạo một file migration mới để alter bảng đó, đúng nguyên tắc Flyway chỉ cộng dồn, không sửa lịch sử.

## Báo cáo kết quả

- Sau khi ghi file thành công, in ra một thông báo ngắn, đã cập nhật thành công thiết kế database vào các file tương ứng, liệt kê rõ đường dẫn file migration và file entity.
- Liệt kê ngắn gọn các index và quan hệ mới được thêm vào để người dùng xem xét.

## Không được làm

- Không dùng Prisma, TypeORM, hoặc bất kỳ ORM nào khác ngoài Spring Data JPA.
- Không tạo khóa ngoại hoặc quan hệ JPA xuyên service.
- Không sửa lại nội dung một file migration đã tồn tại và đã chạy trước đó.
- Không xóa mất entity hoặc cột đã có khi cập nhật thêm phần mới.