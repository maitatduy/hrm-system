# Design brief: quên mật khẩu

Nguồn: `.docs/ideas/03-forgot-password-idea.md`, `.docs/frontend-plans/03-forgot-password-plan.md`. Component dùng chung theo đặc tả ở `01-login-brief.md` mục 2.

## 1. Lưới và bố cục

- Giống màn đăng nhập: trang `canvas-soft`, card `max-w-[480px]` căn giữa, `gap-6`.
- Trong card: tiêu đề "Quên mật khẩu", form `flex flex-col gap-5` gồm banner lỗi (nếu có), ô Email, nút "Gửi mã", link "Quay lại đăng nhập" căn giữa với `pt-1`.
- Không mô tả, không banner thành công. Gửi xong chuyển ngay sang màn nhập OTP.

## 2. Đặc tả component

- `AuthHeader`: chỉ tiêu đề.
- `ForgotPasswordForm`: `FormField` + `TextInput` email, `Button` primary full chiều rộng, `BackToLoginLink`.
- `BackToLoginLink`: `AuthLink` "Quay lại đăng nhập", khóa (màu `ink-faint`) khi đang gửi.

## 3. Màu sắc

Giống bảng màu ở `01-login-brief.md`. Banner lỗi dùng `accent-danger` `#dc2626`.

## 4. Dữ liệu mẫu

```json
{
  "title": "Quên mật khẩu",
  "labels": { "email": "Email", "submit": "Gửi mã", "back": "Quay lại đăng nhập" },
  "prefill": { "email": "nguyenvana@hrm.vn" },
  "errors": {
    "emailRequired": "Nhập email",
    "emailInvalid": "Email không hợp lệ",
    "rateLimited": "Vui lòng chờ 60 giây trước khi yêu cầu mã OTP mới."
  }
}
```
