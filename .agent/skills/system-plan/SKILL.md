---
name: system-planner-backend
description: Chuyển đổi ý tưởng nghiệp vụ, IDEA.md, thành bản thiết kế hệ thống backend, BACKEND_PLAN.md, gồm database, API contract và kiến trúc giao tiếp giữa các service, đúng theo stack Spring Boot 3 microservices của dự án. Dùng khi người dùng yêu cầu quy hoạch backend, thiết kế API, hoặc lập kế hoạch kỹ thuật cho một module backend.
triggers:
  - "/plan-backend"
  - "quy hoạch hệ thống"
---

# Nhiệm vụ: quy hoạch kiến trúc backend

Khi được gọi với đường dẫn một file IDEA cụ thể, đóng vai trò Backend và System Architect cho hệ thống HRM microservices. Nhiệm vụ là đọc yêu cầu nghiệp vụ và dịch thành bản thiết kế kỹ thuật.

Thực hiện tuần tự các bước sau một cách im lặng, chỉ xuất ra kết quả cuối cùng là một file Markdown lưu vào .docs/backend-plans/.

## Bước 1: nạp ngữ cảnh cốt lõi

Trước khi phân tích, bắt buộc đọc và đối chiếu các tài liệu sau.

- Đọc AGENTS.md để nắm đúng stack bắt buộc của dự án, Java 17, Spring Boot 3, Spring Cloud, MySQL, Kafka, OpenFeign, Redis, và danh sách service hiện có, api-gateway, discovery-server, config-server, auth-service, employee-service, attendance-service, leave-service, payroll-service. Không đề xuất công nghệ nằm ngoài danh sách này, không tự ý thêm RabbitMQ, MongoDB, hay bất kỳ công nghệ nào project chưa dùng.
- Đọc .agent/rules/backend-standards.md để nắm đúng quy ước package, cấu trúc DTO request và response, quy tắc giao tiếp đồng bộ qua OpenFeign và bất đồng bộ qua Kafka.
- Đọc .docs/ARCHITECTURE.md nếu có, để nắm luồng nghiệp vụ tổng thể và các quyết định thiết kế database đã thống nhất từ trước, ví dụ nguyên tắc payslip phải là snapshot bất biến.
- Rà soát các service đã tồn tại trong backend để tận dụng module nền tảng sẵn có, ví dụ middleware xác thực JWT trong auth-service, exception handler chung, tránh thiết kế lại từ đầu những gì đã có.
- Xác định rõ module trong IDEA thuộc về service nào trong số các service đã liệt kê, nếu không rõ hoặc cần một service mới, dừng lại và hỏi người dùng trước khi tiếp tục, không tự ý quyết định tách service mới.

## Bước 2: xuất bản thiết kế

Tạo file .docs/backend-plans/[tên-module]-plan.md, tuân thủ chặt chẽ ba trụ cột thiết kế sau.

### Trụ cột 1: thiết kế dữ liệu

- Liệt kê các bảng cần tạo mới hoặc chỉnh sửa, trong đúng database của service đang phụ trách module này, theo nguyên tắc database riêng cho mỗi service.
- Mô tả chi tiết từng trường, tên, kiểu dữ liệu MySQL, có bắt buộc hay không.
- Khóa chính dùng kiểu UUID theo đúng quy ước trong backend-standards.md, mọi bảng có createdAt, updatedAt, createdBy, updatedBy.
- Không thiết kế khóa ngoại trỏ sang bảng ở database của service khác, vì mỗi service có database riêng biệt, quan hệ giữa dữ liệu của hai service khác nhau chỉ lưu dưới dạng một cột id tham chiếu, dữ liệu đầy đủ lấy qua OpenFeign hoặc qua event Kafka khi cần, không join trực tiếp.
- Ghi chú các cột cần đánh index để tối ưu truy vấn thường dùng, ví dụ cột trạng thái, cột ngày tháng dùng để lọc.
- Nếu có bảng Flyway migration mới, ghi rõ tên file migration theo đúng định dạng đang dùng trong db/migration của service đó.

### Trụ cột 2: giao kèo API

- Định nghĩa rõ các endpoint sẽ cung cấp, method, route theo đúng chuẩn kebab-case đã quy định trong AGENTS.md, ví dụ /api/leave-requests, không dùng /api/v1 nếu project hiện chưa áp dụng versioning theo kiểu đó.
- Mỗi endpoint ghi rõ request payload, chia theo path param, query param, và request body, định nghĩa dưới dạng DTO đặt trong package request theo đúng backend-standards.md.
- Mỗi endpoint ghi rõ response payload, cả trường hợp thành công và thất bại, response lỗi theo đúng chuẩn chung status, message, errors đã quy định.
- Ghi chú rõ endpoint nào cần xác thực JWT, và role nào được phép gọi, ADMIN, HR, MANAGER, EMPLOYEE, đúng theo cách phân quyền ở api-gateway và kiểm tra lại bằng PreAuthorize ở service.
- Không trả Entity trực tiếp trong response, luôn qua DTO response và mapper theo đúng quy ước đã có.

### Trụ cột 3: giao tiếp giữa service và xử lý bất đồng bộ

- Đánh giá luồng nghiệp vụ này có cần gọi sang service khác không, nếu cần dữ liệu ngay để trả response, dùng OpenFeign kèm fallback Resilience4j, nêu rõ gọi sang service nào, lấy dữ liệu gì.
- Đánh giá luồng nghiệp vụ này có phát sinh sự kiện mà service khác cần biết không, ví dụ đơn nghỉ phép được duyệt thì payroll-service cần biết, nếu có, thiết kế event Kafka, đặt tên topic theo đúng dạng hrm.service.event, mô tả rõ payload của event.
- Đánh giá có cần cache bằng Redis không, chỉ áp dụng cho dữ liệu đọc nhiều và ít thay đổi, ví dụ danh sách phòng ban, danh sách loại nghỉ phép, không cache dữ liệu thay đổi liên tục như trạng thái chấm công hôm nay.
- Nếu có tác vụ nặng, ví dụ tính lương cho toàn bộ nhân viên trong một kỳ, thiết kế chạy bất đồng bộ thông qua Kafka hoặc một tiến trình nền trong chính service đó, tuyệt đối không xử lý đồng bộ trong cùng một request khiến client phải chờ lâu.

## Báo cáo kết quả

Sau khi tạo file xong, in ra đúng một câu, "Đã hoàn tất bản quy hoạch backend tại file [tên file], sẵn sàng cho Antigravity thi công API."

## Không được làm

- Không đề xuất công nghệ ngoài danh sách đã liệt kê trong AGENTS.md, ví dụ không đề xuất RabbitMQ, MongoDB, hay framework backend khác ngoài Spring Boot.
- Không thiết kế khóa ngoại xuyên service.
- Không tự ý tạo service mới nếu chưa hỏi người dùng.
- Không trả Entity trực tiếp ra API.