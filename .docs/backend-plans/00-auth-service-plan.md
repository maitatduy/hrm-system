# Backend plan: auth-service

Phục vụ các màn hình 01 đến 05, phần tài khoản trong màn 14, settings tab Người dùng và tab Bảo mật.

## Trụ cột 1: thiết kế dữ liệu

Database riêng của auth-service.

### Bảng users
- id, UUID, khóa chính.
- employeeId, UUID, tham chiếu sang employee-service, không phải khóa ngoại JPA vì khác database.
- email, VARCHAR, unique.
- passwordHash, VARCHAR, dùng bcrypt với saltRound 12.
- role, ENUM gồm ADMIN, HR, MANAGER, EMPLOYEE. Chọn một role duy nhất mỗi tài khoản để khớp đúng với toàn bộ UI đã thiết kế, không làm bảng role nhiều nhiều vì chưa có màn hình nào cần gán nhiều role cùng lúc cho một người.
- status, ENUM gồm ACTIVE, LOCKED.
- lastLoginAt, DATETIME, nullable.
- createdAt, updatedAt, createdBy, updatedBy.

Index, unique trên email, index trên role, index trên status.

### Migration
- File V1__create_users_table.sql, tạo bảng users với các cột trên.

## Trụ cột 2: giao kèo API

Tất cả route dưới /api/auth hoặc /api/accounts, kebab-case.

- POST /api/auth/login, body email và password, trả accessToken và thông tin user, đặt refreshToken vào cookie HttpOnly qua header Set-Cookie, không cần xác thực trước.
- POST /api/auth/refresh-token, đọc refreshToken từ cookie, trả accessToken mới, không cần xác thực trước.
- POST /api/auth/logout, cần xác thực, đưa accessToken vào blacklist, xóa refreshToken.
- GET /api/auth/me, cần xác thực, trả thông tin user hiện tại.
- POST /api/auth/forgot-password, body email, luôn trả thông báo chung chung dù email có tồn tại hay không, không cần xác thực trước.
- POST /api/auth/verify-otp, body email và otp, trả resetToken nếu đúng, không cần xác thực trước.
- POST /api/auth/reset-password, body resetToken và newPassword, không cần xác thực trước vì resetToken đã thay thế vai trò xác thực.
- PUT /api/auth/change-password, cần xác thực, body currentPassword và newPassword.
- GET /api/accounts, cần xác thực, chỉ ADMIN, trả danh sách tài khoản kèm phân trang, có join thông tin tên và phòng ban từ employee-service.
- POST /api/accounts, chỉ ADMIN, body employeeId, email, role, passwordMode.
- PUT /api/accounts/{id}/role, chỉ ADMIN, body role mới.
- PUT /api/accounts/{id}/lock, PUT /api/accounts/{id}/unlock, chỉ ADMIN.

Response lỗi dùng đúng chuẩn chung status, message, errors. Không trả passwordHash trong bất kỳ response nào.

## Trụ cột 3: giao tiếp giữa service và xử lý bất đồng bộ

- Gọi sang employee-service qua OpenFeign để xác nhận employeeId tồn tại khi tạo tài khoản, và để lấy tên cùng phòng ban khi hiển thị danh sách tài khoản, có fallback Resilience4j trả về thông tin rút gọn nếu employee-service tạm thời lỗi.
- Redis dùng cho ba việc, lưu refreshToken theo jti kèm TTL bằng thời gian sống của refresh token, lưu blacklist accessToken theo token kèm TTL bằng thời gian còn lại của access token, lưu mã OTP theo email kèm TTL năm phút (`TokenService.OTP_TTL`), không lưu OTP trong MySQL vì đây là dữ liệu ngắn hạn.
- OTP không lưu nguyên văn trong Redis mà lưu HMAC-SHA256 của chuỗi email và mã, khóa là `jwt.secret`. Người đọc được Redis cũng không biết mã và không dò ngược được nếu không có khóa.
- Gửi email chứa mã OTP xử lý bất đồng bộ bằng @Async trong chính auth-service, không block request trả lời cho client, vì đây là tác vụ gửi một email đơn lẻ, chưa cần đẩy qua Kafka. Quyết định không tách notification-service ở giai đoạn này, sẽ tách khi các module khác cũng cần gửi thông báo, mọi chỗ gọi đi qua interface `EmailService` để đổi cài đặt dễ dàng.
- Không publish event nào ra ngoài cho module này ở giai đoạn đầu.

## Gửi email OTP

- Gửi qua SMTP bằng `JavaMailSender` (spring-boot-starter-mail), nội dung dựng từ template Thymeleaf `templates/mail/otp-code.html`, kèm bản chữ thuần cho trình đọc mail không hỗ trợ HTML.
- Tiêu đề "Mã xác thực HRM System", nội dung gồm mã sáu số, thời hạn năm phút và lời nhắc bỏ qua nếu không phải người dùng yêu cầu. Không kèm link.
- Chạy trên thread pool riêng `mailTaskExecutor` (2 đến 4 luồng, hàng đợi 200) để SMTP chậm không ảnh hưởng tác vụ khác.
- Thử lại tối đa ba lần, chờ tăng dần giữa các lần (`app.mail.retry-backoff-ms`, mặc định 2 giây). Hết lượt thì chỉ ghi log lỗi, API forgot-password vẫn trả kết quả chung chung như cũ.
- Không bao giờ ghi mã OTP ra log, email người nhận được che bớt khi ghi log.
- Cấu hình qua biến môi trường:

| Biến | Ý nghĩa | Dev (Mailpit) |
| :-- | :-- | :-- |
| `SPRING_MAIL_HOST` | máy chủ SMTP | `localhost` |
| `SPRING_MAIL_PORT` | cổng SMTP | `1025` |
| `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD` | tài khoản SMTP | để trống |
| `SPRING_MAIL_SMTP_AUTH` | bật xác thực SMTP | `false` |
| `SPRING_MAIL_SMTP_STARTTLS_ENABLE` | bật STARTTLS | `false` |
| `MAIL_FROM`, `MAIL_FROM_NAME` | người gửi | `no-reply@hrm.local`, `HRM System` |

- Môi trường dev dùng Mailpit để bắt toàn bộ email, xem tại giao diện web cổng 8025. Môi trường thật dùng nhà cung cấp SMTP như Brevo, SendGrid hoặc Amazon SES, có bật xác thực và STARTTLS.
- Test: unit test thử lại bằng `JavaMailSender` giả lập, test gửi thật qua GreenMail chạy trong JUnit.