# AGENTS.md - HRM System

Rules dùng chung cho mọi AI coding agent, gồm Antigravity, Cursor và Claude Code.

## Project

HRM System là phần mềm quản lý nhân sự nội bộ doanh nghiệp, backend xây theo kiến trúc microservices.

## Services

| Service            | Trách nhiệm                                                                       |
| ------------------ | --------------------------------------------------------------------------------- |
| api-gateway        | Điểm vào duy nhất của hệ thống, xử lý routing và xác thực JWT                     |
| discovery-server   | Service discovery, dùng Eureka                                                    |
| config-server      | Cấu hình tập trung cho toàn hệ thống                                              |
| auth-service       | Đăng nhập, đăng ký, cấp và refresh JWT, quản lý user và role                      |
| employee-service   | Nhân viên, phòng ban, chức vụ                                                     |
| attendance-service | Chấm công                                                                         |
| leave-service      | Nghỉ phép và quy trình duyệt                                                      |
| payroll-service    | Tính lương, bảng lương, chỉ ADMIN và HR được truy cập                             |
| common-lib         | Thư viện dùng chung gồm DTO event, exception, constant, không chứa business logic |

## Tech Stack

| Layer                 | Technology                                                   |
| --------------------- | ------------------------------------------------------------ |
| Backend               | Java 17, Spring Boot 3, Spring Cloud 2023.x                  |
| Service Discovery     | Eureka                                                       |
| API Gateway           | Spring Cloud Gateway                                         |
| Config                | Spring Cloud Config Server                                   |
| Giao tiếp đồng bộ     | OpenFeign, dùng Resilience4j làm circuit breaker             |
| Giao tiếp bất đồng bộ | Kafka                                                        |
| Database              | MySQL, mỗi service một database riêng, migration bằng Flyway |
| Frontend              | React 19, TypeScript, Vite, TailwindCSS v4                   |
| API Docs              | springdoc-openapi cho từng service                           |

## Architecture

```
backend/
  api-gateway/
  discovery-server/
  config-server/
  common-lib/                # shared DTO, event contract, exception, không chứa logic nghiệp vụ
  auth-service/
    src/main/java/com/company/hrm/auth/
      controller/ service/ repository/ entity/ dto/ request/ response/ mapper/ security/
    src/main/resources/db/migration/
  employee-service/           # cấu trúc package tương tự auth-service
  attendance-service/
  leave-service/
  payroll-service/

frontend/
  src/
    features/
      employee/
      leave/
      attendance/
      payroll/
      auth/
    components/
    lib/                       # axios instance trỏ tới api-gateway
    routes/
```

## Communication Rules

- Gọi đồng bộ khi cần dữ liệu ngay để trả response.
- Dùng sự kiện bất đồng bộ cho các nghiệp vụ không cần phản hồi ngay.
- Không service nào được truy cập trực tiếp database của service khác.
- Mọi request từ frontend đi qua api-gateway, không gọi thẳng service lẻ.

## Coding Standards

- Mỗi service giữ layer rõ ràng theo thứ tự controller, service, repository. Business logic chỉ nằm ở service.
- Entity không expose ra ngoài, luôn đi qua DTO và mapper.
- Frontend tổ chức theo feature, mỗi feature tự quản lý component, hook và type riêng.
- API path đặt tên theo kebab-case, ví dụ /api/leave-requests.
- Biến và hàm JavaScript dùng camelCase, class Java dùng PascalCase.
- Topic Kafka đặt tên theo dạng hrm.service.event.

## Testing

- Mỗi service viết unit test cho phần service bằng JUnit 5 và Mockito.
- Test tích hợp API bằng SpringBootTest cho luồng chính của từng service.
- Test giao tiếp giữa các service qua Feign và Kafka bằng WireMock hoặc embedded Kafka.
- Frontend test component và hook quan trọng bằng Vitest và React Testing Library.
- Mỗi PR thêm tính năng mới cần kèm test tối thiểu cho luồng chính.

## Git Workflow

- Mỗi service có thể có pipeline CI/CD riêng, build, test và deploy độc lập.
- Đặt tên nhánh theo dạng feature/ten-service-ten-tinh-nang hoặc fix/ten-service-mo-ta-loi.
- Commit message viết theo Conventional Commits, ví dụ feat, fix, refactor, chore.
- Không commit trực tiếp vào main hoặc develop.

## Known Constraints

- Payroll-service chứa dữ liệu nhạy cảm, chỉ role ADMIN và HR được truy cập, cần kiểm tra phân quyền ở cả gateway lẫn service.
- Toàn bộ thời gian lưu ở backend dùng UTC, việc chuyển đổi timezone thực hiện ở frontend.
- Khi thêm service mới, cần đăng ký với discovery-server, thêm route ở api-gateway, và thêm config ở config-server.
