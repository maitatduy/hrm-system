---
name: api-coding
description: Viết các API endpoint Spring Boot dựa trên trụ cột 2 của BACKEND_PLAN.md, dùng đúng entity đã có từ database-coding, và trực tiếp tạo file controller, service, DTO vật lý trong dự án. Dùng khi người dùng yêu cầu code API, viết endpoint, hoặc hiện thực hóa backend plan thành code chạy được.
triggers:
  - "/api-coding"
  - "viết api"
---

# Nhiệm vụ: Backend Developer thực thi API

Khi nhận lệnh kèm đường dẫn một file backend plan, đóng vai trò Backend Developer cho hệ thống HRM microservices. Nhiệm vụ là hiện thực hóa trụ cột 2, giao kèo API, thành code Spring Boot thực tế, chạy được.

Thực hiện tuần tự các bước sau một cách im lặng.

## Bước 1: nạp ngữ cảnh kiềng ba chân

Để viết API không bị lệch, bắt buộc đọc ba nguồn sau trước khi viết bất kỳ dòng code nào.

1. AGENTS.md và .agent/rules/backend-standards.md, xác nhận project dùng Spring Boot 3, Controller gọi Service, Service gọi Repository, không dùng Next.js Server Actions, không dùng Express Route, không dùng NestJS Controller kiểu decorator riêng của nó, chỉ dùng đúng annotation Spring Web.
2. File backend plan được truyền vào, đọc đúng trụ cột 2, lấy danh sách method, route, request payload, response payload, và role được phép gọi từng endpoint.
3. File entity Java đã có sẵn trong backend/[service]/.../entity/, do skill database-coding tạo ra trước đó, đối chiếu đúng tên bảng, tên trường, kiểu dữ liệu, không tự đoán hoặc đặt tên khác đi. Nếu entity cần dùng chưa tồn tại, dừng lại và báo cho người dùng chạy database-coding trước, không tự ý tạo entity trong skill này.

## Bước 2: kỷ luật viết API

- Validate đầu vào bằng Jakarta Bean Validation ngay trên request DTO, dùng @NotBlank, @NotNull, @Email, @Size, @Min, @Max tuỳ loại trường, gắn @Valid ở tham số controller, tuyệt đối không tin dữ liệu gửi từ client mà không validate.
- Không bọc thủ công từng thao tác gọi database trong try-catch tại controller hoặc service, lỗi nghiệp vụ ném ra dưới dạng exception riêng, ví dụ ResourceNotFoundException, BadRequestException, và để RestControllerAdvice đã có sẵn trong service xử lý tập trung, trả về đúng format chung gồm status, message, errors. Chỉ dùng try-catch khi gọi ra ngoài qua OpenFeign và cần xử lý fallback cụ thể.
- Trả đúng HTTP status code cho từng tình huống, 200 cho GET và PUT thành công, 201 cho POST tạo mới thành công, 400 khi dữ liệu không hợp lệ, 401 khi chưa xác thực, 403 khi không đủ quyền, 404 khi không tìm thấy, 500 chỉ dành cho lỗi hệ thống không lường trước.
- Mỗi endpoint cần phân quyền theo đúng role đã ghi trong backend plan, gắn @PreAuthorize với đúng role, ví dụ @PreAuthorize signifying hasRole ADMIN hoặc HR, không bỏ sót endpoint nào cần bảo vệ.
- Controller chỉ nhận request và gọi service, không chứa business logic, toàn bộ logic xử lý nằm trong service, đúng theo backend-standards.md.
- Không trả Entity trực tiếp ra ngoài, luôn map sang response DTO bằng MapStruct.

## Bước 3: thực thi ghi file

- Dựa vào đúng cấu trúc package đã quy định trong backend-standards.md, tạo hoặc cập nhật các file sau cho mỗi nhóm endpoint, controller trong package controller, service trong package service, request DTO trong package dto.request, response DTO trong package dto.response, mapper trong package mapper nếu chưa có sẵn.
- Trực tiếp tạo mới hoặc cập nhật file code vật lý trong dự án, không chỉ in code ra màn hình chat.
- Nếu controller hoặc service cho module này đã tồn tại, chỉ thêm method mới hoặc sửa đúng phần liên quan, tuyệt đối không xóa mất các method khác đã có từ trước.
- Tự động import đúng Repository tương ứng với entity, và đúng class exception dùng chung của service đó, vào đầu file.

## Báo cáo kết quả

Sau khi ghi file xong, in ra danh sách các endpoint vừa tạo hoặc chỉnh sửa, gồm method, route, và đường dẫn file vật lý tương ứng, để người dùng kiểm tra.

## Không được làm

- Không dùng Zod, Joi, hoặc class-validator, chỉ dùng Jakarta Bean Validation.
- Không viết theo kiến trúc Next.js, Express, hoặc NestJS.
- Không tự tạo entity mới trong skill này, entity phải đến từ database-coding.
- Không bỏ sót @PreAuthorize cho endpoint cần phân quyền theo backend plan.
- Không trả Entity trực tiếp trong response.