# Tiến độ dự án: HRM System

## 1. Trạng thái các màn hình & tính năng

### Khung sườn & Xác thực

- [x] **Master Layout**: Đã hoàn thành ý tưởng (`00-master-layout-idea.md`), kế hoạch frontend (`00-master-layout-plan.md`), đặc tả thiết kế UI (`00-master-layout-brief.md`) và bản vẽ giao diện trên Stitch.
- [x] **Màn hình Đăng nhập (Login)**: Đã hoàn thành ý tưởng (`01-login-idea.md`), kế hoạch frontend (`01-login-plan.md`), đặc tả thiết kế UI (`01-login-brief.md`) và bản vẽ giao diện trên Stitch.
- [x] **Thi công code Frontend**: Khởi tạo dự án Vite + React 19 + TailwindCSS v4, xây dựng thư viện shared UI, hoàn thiện màn hình Đăng nhập theo Stitch và tích hợp auth store/mutation.
- [x] **Tính năng Đăng xuất (Logout)**: Hoàn thành ý tưởng (`02-logout-idea.md`), frontend plan (`02-logout-plan.md`), design brief (`02-logout-brief.md`) và triển khai code (ConfirmDialog, UserProfileDropdown, LogoutDialogContainer, useLogoutMutation).
- [x] **Màn hình Quên mật khẩu (Forgot Password)**: Hoàn thành ý tưởng (`03-forgot-password-idea.md`), frontend plan (`03-forgot-password-plan.md`), design brief (`03-forgot-password-brief.md`), bản vẽ Stitch và triển khai code (ForgotPasswordPage, ForgotPasswordFormContainer, ForgotPasswordForm, useForgotPasswordMutation).
- [x] **Màn hình Xác thực mã OTP (OTP Verification)**: Hoàn thành ý tưởng (`04-otp-verification-idea.md`), frontend plan (`04-otp-verification-plan.md`), design brief (`04-otp-verification-brief.md`), bản vẽ Stitch và triển khai code (OtpVerificationPage, OtpVerificationFormContainer, OtpVerificationForm, OtpInputGroup, OtpSlotInput, MaskedEmailNotice, useVerifyOtpMutation, useResendOtpMutation).
- [x] **Màn hình Đổi & Đặt lại mật khẩu (Change / Reset Password)**: Hoàn thành ý tưởng (`05-change-password-idea.md`), frontend plan (`05-change-password-plan.md`), design brief (`05-change-password-brief.md`), bản vẽ Stitch và triển khai code (ResetPasswordPage, ResetPasswordContainer, ChangePasswordContainer, PasswordChangeForm, SettingsCard, useResetPasswordMutation, useChangePasswordMutation).

---

## 2. Nhật ký cập nhật

- **[2026-09-29 15:48]**: Hoàn thành quy hoạch frontend và design brief cho Master Layout và Màn hình Đăng nhập; hoàn thiện bản vẽ giao diện đồ họa cả hai màn hình trên Stitch qua MCP.
- **[2026-09-29 18:40]**: Khởi tạo frontend (React 19, TailwindCSS v4), hoàn thành các Shared UI components và màn hình Đăng nhập theo bản vẽ Stitch.
- **[2026-10-02 09:57]**: Hoàn thành thiết kế và triển khai code tính năng Đăng xuất gồm ConfirmDialog, UserProfileDropdown, useLogoutMutation và tích hợp Master Layout.
- **[2026-10-02 11:20]**: Hoàn thành thiết kế Stitch và thi công code màn hình Quên mật khẩu cùng Xác thực mã OTP, tích hợp TanStack Query và router.
- **[2026-10-02 13:35]**: Hoàn thành thiết kế Stitch và thi công code màn hình Đặt lại mật khẩu cùng Đổi mật khẩu trong Cài đặt, tích hợp TanStack Query và router.
