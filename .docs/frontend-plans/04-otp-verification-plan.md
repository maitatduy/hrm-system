# Kế hoạch frontend: nhập mã OTP

Nguồn: `.docs/ideas/04-otp-verification-idea.md`. Code: `frontend/src/features/auth/`.

## 1. Phân rã component

```
GuestRoute [SMART]
└── OtpVerificationPage [SMART]               pages/OtpVerificationPage.tsx, đọc ?email
    └── AuthLayout > AuthCard [SHARED UI]
        ├── AuthHeader [DUMB]                  "Nhập mã OTP", "Đã gửi tới ng***a@hrm.vn"
        └── OtpVerificationFormContainer [SMART]
            └── OtpVerificationForm [DUMB]
                ├── FormFeedbackBanner [SHARED UI]
                ├── OtpInputGroup [DUMB] [SHARED UI]   6 ô
                ├── Button [SHARED UI]                 Xác nhận
                ├── OtpResendSection [DUMB]            Gửi lại mã sau mm:ss / Gửi lại mã
                └── BackToLoginLink [DUMB]
```

- Thiếu `?email` thì `Navigate` về `/forgot-password`.
- `useOtpInput(6)`: giữ từng chữ số, tự sang ô kế tiếp, Backspace lùi ô, phím mũi tên, dán cả mã (lọc ký tự không phải số).
- `useCountdown(60)`: đếm ngược gửi lại, `restart()` sau khi gửi lại thành công.
- Xác nhận: thiếu số thì báo `otpIncomplete(6)` = "Nhập đủ 6 số". Gọi `useVerifyOtpMutation` (`POST /api/auth/verify-otp`), thành công thì `navigate("/reset-password", { replace: true, state: { email, resetToken } })`.
- Gửi lại: gọi lại `useForgotPasswordMutation`, thành công thì xóa các ô và đếm lại 60 giây.

## 2. Quản lý trạng thái

| State | Tầng |
| :-- | :-- |
| `digits`, `activeIndex`, ref các ô | `useOtpInput` (`useState`, `useRef`) |
| `secondsLeft` | `useCountdown` |
| Lỗi | `useState<FormFeedback \| null>`, xóa khi người dùng gõ hoặc dán |
| Email | URL `?email` |
| Reset token | history state, không đặt trên URL |

## 3. Cấu trúc dữ liệu

```ts
interface VerifyOtpRequest {
    readonly email: string;
    readonly otp: string;
}

interface VerifyOtpResponse {
    readonly resetToken: string;
}

interface ResetPasswordLocationState {
    readonly email: string;
    readonly resetToken: string;
}

interface OtpInputGroupProps {
    readonly digits: readonly string[];
    readonly activeIndex: number;
    readonly disabled?: boolean;
    readonly isError?: boolean;
    readonly onDigitChange: (index: number, value: string) => void;
    readonly onKeyDown: (index: number, event: KeyboardEvent<HTMLInputElement>) => void;
    readonly onPaste: (event: ClipboardEvent<HTMLInputElement>) => void;
    readonly onFocus: (index: number) => void;
    readonly registerInputRef: (index: number, element: HTMLInputElement | null) => void;
}

interface OtpResendSectionProps {
    readonly secondsLeft: number;
    readonly isResending: boolean;
    readonly onResend: () => void;
}
```
