---
trigger: always_on
---

# Coding Standards - HRM System

Rule chi tiết, chỉ nạp khi agent thực sự viết hoặc sửa code, không nạp mọi lúc như GEMINI.md và AGENTS.md.

## Thư viện bắt buộc theo layer

Backend, áp dụng cho mỗi service:

- Mapping giữa entity và DTO dùng MapStruct, không map thủ công.
- Validation dùng Jakarta Bean Validation, ví dụ @Valid và @NotBlank.
- Dùng Lombok cho getter, setter và builder, không viết tay.
- Tài liệu API dùng springdoc-openapi.

Frontend:

- Data fetching và cache dùng TanStack Query.
- State toàn cục dùng Zustand.
- Form dùng React Hook Form kết hợp Zod.
- UI dùng TailwindCSS v4 kết hợp shadcn/ui.
- Gọi API qua một axios instance duy nhất, trỏ tới api-gateway.

## Conventions

Backend, trong mỗi service:

- Cấu trúc package theo layer, đi từ controller sang service, repository, entity, rồi tới dto gồm request và response.
- Controller không chứa business logic, chỉ nhận request và gọi service.
- Mọi entity có id kiểu UUID, có createdAt, updatedAt, createdBy và updatedBy.
- Exception xử lý qua RestControllerAdvice riêng trong từng service, response trả về theo chuẩn gồm status, message và errors.
- Không trả trực tiếp entity ra ngoài, luôn đi qua DTO.
- Phân quyền theo role gồm ADMIN, HR, MANAGER và EMPLOYEE, xử lý ở api-gateway và kiểm tra lại ở service bằng PreAuthorize.

Giao tiếp giữa các service:

- Khi cần đọc dữ liệu tổng hợp hoặc cần dữ liệu ngay, gọi qua OpenFeign, có fallback và circuit breaker dùng Resilience4j.
- Sự kiện nghiệp vụ publish và subscribe qua Kafka, không gọi đồng bộ chéo giữa các service cho việc này.
- Mỗi service không được truy cập trực tiếp database của service khác, chỉ qua API hoặc event.
- Đặt tên topic Kafka theo dạng hrm.service.event.

Frontend:

- Tổ chức theo feature, ví dụ features/employee, features/leave.
- Gọi API qua custom hook dùng TanStack Query, mọi request đều đi qua gateway.
- Tên component viết theo PascalCase, tên hook bắt đầu bằng use.
- Không dùng kiểu any, nếu chưa rõ kiểu thì dùng unknown rồi narrow lại sau.

## Không được làm

- Không tạo bảng dùng chung giữa nhiều service, mỗi service sở hữu schema riêng.
- Không gọi thẳng từ frontend xuống một service lẻ, bỏ qua gateway.
- Không hardcode URL của service khác, lấy qua service discovery hoặc config server.
- Không hardcode secret hay connection string, dùng biến môi trường và config server.
- Không tự ý thêm service mới hoặc đổi cấu trúc thư mục gốc nếu chưa hỏi trước.
- Không dùng gọi đồng bộ cho các luồng nên xử lý bất đồng bộ, vì dễ gây coupling chặt và cascading failure.
