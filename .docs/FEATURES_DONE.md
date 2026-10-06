# Tiến độ dự án: HRM System

## 1. Trạng thái các màn hình & tính năng

### Khung sườn & Xác thực

- [x] **Master Layout**: Đã hoàn thành ý tưởng (`00-master-layout-idea.md`), kế hoạch frontend (`00-master-layout-plan.md`), đặc tả thiết kế UI (`00-master-layout-brief.md`) và bản vẽ giao diện trên Stitch.
- [x] **Màn hình Đăng nhập (Login)**: Đã hoàn thành ý tưởng (`01-login-idea.md`), kế hoạch frontend (`01-login-plan.md`), đặc tả thiết kế UI (`01-login-brief.md`) và bản vẽ giao diện trên Stitch.
- [x] **Thi công code Frontend**: Khởi tạo dự án Vite + React 19 + TailwindCSS v4, xây dựng thư viện shared UI, hoàn thiện màn hình Đăng nhập theo Stitch và tích hợp auth store/mutation.
- [x] **Tính năng Đăng xuất (Logout)**: Hoàn thành ý tưởng (`02-logout-idea.md`), frontend plan (`02-logout-plan.md`), design brief (`02-logout-brief.md`) và triển khai code (ConfirmDialog, UserMenu, LogoutDialogContainer, useLogoutMutation).
- [x] **Màn hình Quên mật khẩu (Forgot Password)**: Hoàn thành ý tưởng (`03-forgot-password-idea.md`), frontend plan (`03-forgot-password-plan.md`), design brief (`03-forgot-password-brief.md`), bản vẽ Stitch và triển khai code (ForgotPasswordPage, ForgotPasswordFormContainer, ForgotPasswordForm, useForgotPasswordMutation).
- [x] **Màn hình Xác thực mã OTP (OTP Verification)**: Hoàn thành ý tưởng (`04-otp-verification-idea.md`), frontend plan (`04-otp-verification-plan.md`), design brief (`04-otp-verification-brief.md`), bản vẽ Stitch và triển khai code (OtpVerificationPage, OtpVerificationFormContainer, OtpVerificationForm, OtpInputGroup, OtpResendSection, useOtpInput, useCountdown, useVerifyOtpMutation).
- [x] **Màn hình Đổi & Đặt lại mật khẩu (Change / Reset Password)**: Hoàn thành ý tưởng (`05-change-password-idea.md`), frontend plan (`05-change-password-plan.md`), design brief (`05-change-password-brief.md`), bản vẽ Stitch và triển khai code (ResetPasswordPage, ResetPasswordContainer, ChangePasswordContainer, PasswordChangeForm, SettingsCard, useResetPasswordMutation, useChangePasswordMutation).
- [x] **Màn hình Tổng quan (Dashboard)**: Hoàn thành ý tưởng (`06-dashboard-idea.md`), frontend plan (`06-dashboard-plan.md`), design brief (`06-dashboard-brief.md`) và triển khai code (DashboardPage, StatsOverviewContainer, AttendanceTrendContainer, DepartmentDistributionContainer, RecentActivitiesContainer, UpcomingEventsContainer, shared UI StatCard, TrendBadge, SectionCard, ChartLegend, Avatar, Skeleton, SectionErrorState, EmptyState, biểu đồ Recharts). Backend chưa có API thống kê, frontend dùng dữ liệu mẫu khi bật `VITE_USE_MOCK_API=true`.

### Backend & Microservices

- [x] **Kế hoạch Backend auth-service**: Hoàn thành bản thiết kế kỹ thuật backend (`00-auth-service-plan.md`) gồm 3 trụ cột: thiết kế dữ liệu bảng users, giao kèo API xác thực/tài khoản và kiến trúc tích hợp Redis/OpenFeign.
- [x] **Thi công Backend auth-service**: Khởi tạo cấu trúc Maven multi-module, Flyway migration V1 bảng users, JPA entities/enums, bảo mật JWT stateless với Refresh Token Rotation trên Redis, OpenFeign sang employee-service, toàn bộ API Auth và Account management.
- [x] **Thi công Backend api-gateway**: Khởi tạo module api-gateway, cấu hình routing sang auth-service, thiết lập CORS cho phép frontend localhost:5173 và hỗ trợ credentials cho HttpOnly cookie.
- [x] **Thi công Backend discovery-server**: Khởi tạo discovery-server (Eureka Server cổng 8761), cấu hình toàn bộ 7 service còn lại thành Eureka Client tự động đăng ký vào registry.
- [x] **Thi công Backend config-server**: Khởi tạo config-server (Spring Cloud Config cổng 8888) dùng profile native, cấu hình kho lưu trữ file cấu hình local cho tất cả microservices.
- [x] **Gửi OTP qua email (auth-service)**: Gửi mã OTP quên mật khẩu qua SMTP bằng JavaMailSender và template Thymeleaf, thread pool riêng, thử lại 3 lần, không ghi OTP ra log, lưu OTP dạng HMAC trong Redis, test bằng GreenMail.
- [x] **Ghi nhớ đăng nhập**: Backend nhận rememberMe khi đăng nhập, ghi nhớ thì cookie refresh token lưu bền 7 ngày, không ghi nhớ thì cookie phiên và refresh token sống 1 ngày, lựa chọn giữ nguyên qua refresh nhờ claim trong token. Frontend gửi rememberMe và lưu access token vào localStorage hoặc sessionStorage tương ứng.

---

## 2. Nhật ký cập nhật

- **[2026-09-29 15:48]**: Hoàn thành quy hoạch frontend và design brief cho Master Layout và Màn hình Đăng nhập; hoàn thiện bản vẽ giao diện đồ họa cả hai màn hình trên Stitch qua MCP.
- **[2026-09-29 18:40]**: Khởi tạo frontend (React 19, TailwindCSS v4), hoàn thành các Shared UI components và màn hình Đăng nhập theo bản vẽ Stitch.
- **[2026-10-02 09:57]**: Hoàn thành thiết kế và triển khai code tính năng Đăng xuất gồm ConfirmDialog, UserProfileDropdown, useLogoutMutation và tích hợp Master Layout.
- **[2026-10-02 11:20]**: Hoàn thành thiết kế Stitch và thi công code màn hình Quên mật khẩu cùng Xác thực mã OTP, tích hợp TanStack Query và router.
- **[2026-10-02 13:35]**: Hoàn thành thiết kế Stitch và thi công code màn hình Đặt lại mật khẩu cùng Đổi mật khẩu trong Cài đặt, tích hợp TanStack Query và router.
- **[2026-10-04 12:18]**: Hoàn thành bản thiết kế backend (00-auth-service-plan.md) cho auth-service gồm schema bảng users, giao kèo 12 API xác thực/tài khoản và kiến trúc Redis/OpenFeign.
- **[2026-10-04 17:15]**: Hoàn thành thi công toàn bộ mã nguồn auth-service (database, JPA entity, JWT authentication với Redis refresh token rotation, OpenFeign client và API quản lý tài khoản).
- **[2026-10-04 18:14]**: Khởi tạo module api-gateway, cấu hình routing, thiết lập CORS (hỗ trợ credentials) và chuẩn hóa file cấu hình .env cho toàn bộ backend.
- **[2026-10-04 18:56]**: Hoàn thành discovery-server (Eureka Server) và config-server (Spring Cloud Config native profile), chuẩn hóa cấu hình Eureka Client và biến môi trường cho 7 microservices.
- **[2026-10-06 11:14]**: Tối giản giao diện các màn xác thực (bỏ logo, mô tả, placeholder, icon trang trí, danh sách yêu cầu mật khẩu), gom message vào `frontend/src/constants/messages.ts`, cập nhật lại ideas, frontend plans và design briefs 00 đến 05 theo đúng code hiện tại.
- **[2026-10-06 11:57]**: Triển khai gửi OTP qua email trong auth-service (không tách notification-service ở giai đoạn này), cấu hình SMTP qua biến môi trường, dev dùng Mailpit, cập nhật `00-auth-service-plan.md`.
- **[2026-10-06 15:20]**: Hoàn thiện chức năng ghi nhớ đăng nhập ở cả backend và frontend, thêm biến `JWT_REFRESH_TOKEN_SESSION_EXPIRATION`.
- **[2026-10-06 21:04]**: Hoàn thành frontend plan và design brief cho màn hình Tổng quan (Dashboard), brief dùng token màu trong `frontend/src/index.css` để đồng bộ với các màn đã code.
- **[2026-10-06 22:34]**: Hoàn thành code màn hình Tổng quan (Dashboard) với thẻ thống kê, biểu đồ chuyên cần và phòng ban, hoạt động gần đây, sự kiện sắp tới, chạy bằng dữ liệu mẫu; thêm icon cho sidebar.
