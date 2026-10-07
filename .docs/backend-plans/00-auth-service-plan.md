# Backend plan: auth-service

Phục vụ các màn hình 01 đến 05, phần tài khoản trong màn 14, settings tab Người dùng và tab Bảo mật.

## Trụ cột 1: thiết kế dữ liệu

Database riêng của auth-service.

### Bảng users
- id, UUID, khóa chính.
- employeeId, UUID, tham chiếu sang employee-service, không phải khóa ngoại JPA vì khác database. Unique (migration V2), cho phép NULL vì ADMIN ban đầu không gắn nhân viên.
- email, VARCHAR, unique.
- passwordHash, VARCHAR, dùng bcrypt với saltRound 12.
- role, ENUM gồm ADMIN, HR, MANAGER, EMPLOYEE. Chọn một role duy nhất mỗi tài khoản để khớp đúng với toàn bộ UI đã thiết kế, không làm bảng role nhiều nhiều vì chưa có màn hình nào cần gán nhiều role cùng lúc cho một người.
- status, ENUM gồm ACTIVE, LOCKED.
- lastLoginAt, DATETIME, nullable.
- createdAt, updatedAt, createdBy, updatedBy.

Index, unique trên email, unique trên employee_id, index trên role, index trên status.

### Migration
- File V1__create_users_table.sql, tạo bảng users với các cột trên.

## Trụ cột 2: giao kèo API

Tất cả route dưới /api/auth hoặc /api/accounts, kebab-case.

- POST /api/auth/login, body email, password và rememberMe, trả accessToken và thông tin user, đặt refreshToken vào cookie HttpOnly qua header Set-Cookie, không cần xác thực trước. rememberMe true: refresh token sống `jwt.refresh-token-expiration` (7 ngày) và cookie có Max-Age tương ứng. rememberMe false: refresh token sống `jwt.refresh-token-session-expiration` (1 ngày) và là cookie phiên không có Max-Age, mất khi đóng trình duyệt. Email không tồn tại vẫn chạy so sánh BCrypt với một hash giả để thời gian phản hồi không lộ email nào đã đăng ký.
- POST /api/auth/refresh-token, đọc refreshToken từ cookie, trả accessToken mới, không cần xác thực trước. Lựa chọn ghi nhớ lưu trong claim `remember` của refresh token nên giữ nguyên qua mỗi lần xoay vòng token, token cũ không có claim được coi là đã ghi nhớ. Refresh token mang `token_version`; phiên bản cũ hơn hiện tại (phiên đã bị thu hồi) trả 401 "Phiên đăng nhập đã hết hiệu lực" mà không chạy logic phát hiện dùng lại, chỉ khi phiên bản khớp mà key không còn trong Redis mới coi là dùng lại token và thu hồi toàn bộ phiên.
- POST /api/auth/logout, không cần xác thực, chỉ dựa vào cookie: xóa refreshToken trong cookie khỏi Redis và xóa cookie, đưa accessToken vào blacklist nếu có gửi kèm và còn hợp lệ. Nhờ vậy vẫn đăng xuất được khi access token đã bị thu hồi (vừa đổi mật khẩu, bị khóa). Frontend không tự gọi refresh khi logout lỗi (`SKIP_REFRESH_PATHS`). Lưu ý CSRF: refresh-token và logout không cần access token, chỉ được bảo vệ nhờ cookie `SameSite=Strict`. Nếu sau này frontend và gateway ở hai site khác nhau và phải đổi sang `SameSite=None`, trang lạ có thể ép người dùng đăng xuất, khi đó cần thêm kiểm tra `Origin` hoặc CSRF token cho hai endpoint này.
- GET /api/auth/me, cần xác thực, trả thông tin user hiện tại.
- POST /api/auth/forgot-password, body email, luôn trả thông báo chung chung dù email có tồn tại hay không, không cần xác thực trước.
- POST /api/auth/verify-otp, body email và otp, trả resetToken nếu đúng, không cần xác thực trước.
- POST /api/auth/reset-password, body resetToken và newPassword, không cần xác thực trước vì resetToken đã thay thế vai trò xác thực.
- PUT /api/auth/change-password, cần xác thực, body currentPassword và newPassword. Đổi xong thu hồi ngay mọi phiên, kể cả phiên hiện tại.
- Chính sách mật khẩu chung (`PasswordPolicy`, annotation `@StrongPassword`) áp cho newPassword khi đổi và đặt lại mật khẩu, mật khẩu MANUAL và BOOTSTRAP_ADMIN_PASSWORD: tối thiểu 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt, khớp `frontend/src/features/auth/passwordRules.ts`. Tối đa 72 byte UTF-8 vì BCrypt bỏ qua phần dư, frontend cũng tính theo byte UTF-8. Mật khẩu trong body tạo tài khoản chỉ được kiểm tra khi chế độ là MANUAL.
- GET /api/accounts, cần xác thực, chỉ ADMIN, trả danh sách tài khoản kèm phân trang, có join thông tin tên và phòng ban từ employee-service.
- POST /api/accounts, chỉ ADMIN, body employeeId, email, role, passwordMode. `MANUAL` dùng mật khẩu admin nhập trong `password` và không gửi email, admin tự giao mật khẩu. Các chế độ còn lại sinh mật khẩu tạm 16 ký tự bằng SecureRandom (đủ chữ hoa, chữ thường, số, ký tự đặc biệt) và gửi tới email của tài khoản qua `AccountCreatedEvent`, listener chỉ gửi sau khi transaction commit. Mật khẩu không bao giờ nằm trong response hay log. Gửi email thất bại thì người dùng dùng luồng quên mật khẩu. Mật khẩu MANUAL phải đạt chính sách mật khẩu chung (`PasswordPolicy`). Trùng email hoặc nhân viên đã có tài khoản trả 409, kể cả khi hai request chạy đồng thời (ràng buộc unique trong database chặn lúc flush). Lỗi trùng khóa được nhận diện không phụ thuộc database (`DataIntegrityErrors`): phân loại UNIQUE của Hibernate, SQLState chuẩn 23505 (H2, PostgreSQL) hoặc mã 1062 của MySQL. Vi phạm ràng buộc khác (NOT NULL, độ dài) vẫn là 500.
- Tài khoản ADMIN đầu tiên: khi khởi động, nếu không còn ADMIN đang hoạt động nào, `AdminBootstrap` tạo ADMIN từ `BOOTSTRAP_ADMIN_EMAIL` và `BOOTSTRAP_ADMIN_PASSWORD` (không gắn employeeId). Đã có ADMIN đang hoạt động thì bỏ qua, không ghi đè. Cấu hình sai (email không hợp lệ, mật khẩu không đạt `PasswordPolicy`, email đã thuộc tài khoản khác) thì dừng khởi động. Có thể xóa hai biến này sau lần chạy đầu.
- PUT /api/accounts/{id}/role, chỉ ADMIN, body role mới. Đổi role thì thu hồi ngay mọi phiên của tài khoản đó, role không đổi thì bỏ qua. Không được tự đổi role của chính mình (400).
- PUT /api/accounts/{id}/lock, PUT /api/accounts/{id}/unlock, chỉ ADMIN. Khóa thì thu hồi ngay mọi phiên. Không được tự khóa chính mình (400).
- Hệ thống luôn phải còn ít nhất một ADMIN đang hoạt động: khóa hoặc hạ quyền ADMIN đang hoạt động cuối cùng trả 409. Các dòng ADMIN đang hoạt động được khóa bằng `SELECT ... FOR UPDATE` trong transaction để hai thao tác đồng thời không cùng vượt qua kiểm tra.

Response lỗi dùng đúng chuẩn chung status, message, errors. Không trả passwordHash trong bất kỳ response nào.

## Trụ cột 3: giao tiếp giữa service và xử lý bất đồng bộ

- Gọi sang employee-service qua OpenFeign để xác nhận employeeId tồn tại khi tạo tài khoản, và để lấy tên cùng phòng ban khi hiển thị danh sách tài khoản, có fallback Resilience4j trả về thông tin rút gọn nếu employee-service tạm thời lỗi.
- Redis dùng cho ba việc, lưu refreshToken theo jti kèm TTL bằng thời gian sống của refresh token, lưu blacklist accessToken theo token kèm TTL bằng thời gian còn lại của access token, lưu mã OTP theo email kèm TTL năm phút (`TokenService.OTP_TTL`), không lưu OTP trong MySQL vì đây là dữ liệu ngắn hạn.
- Access token và refresh token mang claim `token_type` lần lượt là `access` và `refresh`. Đây là cơ chế chính tách hai loại token: filter chỉ nhận `access`, endpoint refresh chỉ nhận `refresh`, nên refresh token không gọi được API và access token đặt vào cookie refresh không kích hoạt thu hồi toàn bộ phiên. Mọi việc tạo khóa và parse JWT đi qua `JwtTokens`.
- Hai loại ký bằng hai secret độc lập, `JWT_SECRET` (`jwt.secret`) cho access token và `JWT_REFRESH_SECRET` (`jwt.refresh-secret`) cho refresh token. `JWT_SECRET` có thể chia sẻ cho service khác để xác thực access token, nhưng service đó cũng giả mạo được access token vì HS256 là khóa đối xứng. `JWT_REFRESH_SECRET` chỉ cấp cho auth-service. Ứng dụng không khởi động nếu hai secret trùng nhau hoặc ngắn hơn 256 bit. Hướng lâu dài khi gateway xác thực JWT: chuyển access token sang RS256 hoặc ES256, gateway chỉ giữ public key.
- Thu hồi phiên ngay lập tức: mỗi user có phiên bản token trong Redis (`auth:token-version:{userId}`, không TTL), access token mang claim `token_version` lúc được cấp, filter từ chối token có phiên bản khác hiện tại. `revokeAllUserTokens` tăng phiên bản và xóa toàn bộ refresh token, được gọi khi khóa tài khoản, đổi role, đổi hoặc đặt lại mật khẩu, và khi phát hiện dùng lại refresh token. Nhờ vậy access token cũ mất hiệu lực ngay ở request kế tiếp, không chờ hết hạn. Refresh token cũng mang phiên bản nên refresh token ghi vào Redis trong lúc đang thu hồi cũng bị từ chối. Chỉ auth-service kiểm tra được phiên bản vì cần đọc Redis: khi api-gateway tự xác thực JWT, gateway phải đọc cùng key Redis hoặc chuyển request qua auth-service, nếu không token đã thu hồi vẫn lọt qua gateway.
- OTP không lưu nguyên văn trong Redis mà lưu HMAC-SHA256 của chuỗi email và mã (`OtpHasher`). OTP chỉ có 1 triệu tổ hợp nên ai có khóa HMAC và đọc được Redis sẽ dò ra mã rất nhanh, vì vậy khóa được dẫn xuất từ `jwt.refresh-secret`, secret chỉ auth-service giữ, theo ngữ cảnh riêng để không dùng chung khóa với việc ký refresh token. Không dùng `jwt.secret` vì secret này có thể được chia sẻ cho service khác.
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