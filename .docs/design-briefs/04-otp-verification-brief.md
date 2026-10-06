# Design brief: nhập mã OTP

Nguồn: `.docs/ideas/04-otp-verification-idea.md`, `.docs/frontend-plans/04-otp-verification-plan.md`. Component dùng chung theo đặc tả ở `01-login-brief.md` mục 2.

## 1. Lưới và bố cục

- Giống màn đăng nhập: trang `canvas-soft`, card `max-w-[480px]` căn giữa, `gap-6`.
- Header: tiêu đề "Nhập mã OTP", dưới là một dòng mô tả "Đã gửi tới <email đã che>".
- Form `flex flex-col gap-5`: banner (nếu có), hàng 6 ô OTP căn giữa `gap-2.5` (`gap-3` từ sm), nút "Xác nhận", nút chữ gửi lại căn giữa, link "Quay lại đăng nhập".

## 2. Đặc tả component

### OtpInputGroup [SHARED UI]
- Mỗi ô `w-12 h-14`, nền `surface`, viền `hairline`, `rounded-xs`, chữ 22px đậm 600 `ink`, căn giữa.
- Ô đang nhập: viền `primary`, `ring-2` `primary` 20%. Hover: viền `hairline-strong`.
- Lỗi: cả 6 ô viền và chữ `accent-danger`, `ring-2` `accent-danger` 20%.
- Disabled: nền `canvas-soft`, chữ `ink-faint`.

### OtpResendSection
- Một nút chữ 15px đậm 500.
- Đang đếm ngược: "Gửi lại mã sau 00:45", màu `ink-faint`, không bấm được, số dùng `tabular-nums`.
- Hết giờ: "Gửi lại mã", màu `primary`, hover gạch chân.

### Button, FormFeedbackBanner, AuthLink
- Theo `01-login-brief.md`. Nút "Xác nhận" primary full chiều rộng.

## 3. Màu sắc

Giống bảng màu ở `01-login-brief.md`. Ô OTP lỗi và banner lỗi dùng `accent-danger` `#dc2626`.

## 4. Dữ liệu mẫu

```json
{
  "title": "Nhập mã OTP",
  "description": "Đã gửi tới ng***a@hrm.vn",
  "digits": ["4", "8", "2", "", "", ""],
  "labels": {
    "submit": "Xác nhận",
    "resendCountdown": "Gửi lại mã sau 00:45",
    "resend": "Gửi lại mã",
    "back": "Quay lại đăng nhập"
  },
  "errors": {
    "incomplete": "Nhập đủ 6 số",
    "invalid": "Mã OTP không chính xác hoặc đã hết hạn",
    "tooManyAttempts": "Bạn đã nhập sai mã OTP quá số lần cho phép. Vui lòng yêu cầu mã mới."
  }
}
```
