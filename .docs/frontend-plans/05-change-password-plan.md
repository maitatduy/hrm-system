# Kế hoạch frontend: đặt lại và đổi mật khẩu

Nguồn: `.docs/ideas/05-change-password-idea.md`. Code: `frontend/src/features/auth/`, `frontend/src/routes/pages/SettingsPage.tsx`.

## 1. Phân rã component

```
GuestRoute [SMART]
└── ResetPasswordPage [SMART]                 đọc history state, thiếu thì về /forgot-password
    └── AuthLayout > AuthCard [SHARED UI]
        ├── AuthHeader [DUMB]                  "Đặt lại mật khẩu"
        └── ResetPasswordContainer [SMART]
            └── PasswordChangeForm [DUMB]      mode="reset", nút "Lưu mật khẩu"

ProtectedRoute > DashboardLayout
└── SettingsPage [DUMB]
    └── SettingsCard [DUMB] [SHARED UI]        "Đổi mật khẩu"
        └── ChangePasswordContainer [SMART]
            └── PasswordChangeForm [DUMB]      mode="change", nút "Đổi mật khẩu"
```

`PasswordChangeForm` gồm `FormFeedbackBanner`, các `FormField` + `PasswordInput` (Mật khẩu hiện tại chỉ ở mode change, Mật khẩu mới, Nhập lại mật khẩu) và `Button`. Không có danh sách yêu cầu độ mạnh mật khẩu.

- Validate theo `mode: "onChange"`, nút lưu bị vô hiệu khi `!formState.isValid`.
- Quy tắc mật khẩu nằm ở `passwordRules.ts` (`isStrongPassword`), message ở `VALIDATION_MESSAGES`.
- `ResetPasswordContainer`: `POST /api/auth/reset-password`, thành công thì `navigate("/login?reason=password_reset", { replace: true })`.
- `ChangePasswordContainer`: `PUT /api/auth/change-password`, thành công thì gọi `useLogoutMutation("password_changed")` vì backend đã thu hồi refresh token.

## 2. Quản lý trạng thái

| State | Tầng |
| :-- | :-- |
| Giá trị form, lỗi, `isValid` | React Hook Form + zod |
| Lỗi server | `useState<FormFeedback \| null>` |
| Đang gửi | `isPending` của mutation (đổi mật khẩu tính cả lúc đăng xuất) |
| Reset token | history state từ màn OTP |

## 3. Cấu trúc dữ liệu

```ts
interface ResetPasswordFormValues {
    newPassword: string;
    confirmPassword: string;
}

interface ChangePasswordFormValues extends ResetPasswordFormValues {
    currentPassword: string;
}

interface PasswordFieldProps {
    readonly registration: UseFormRegisterReturn;
    readonly error?: string;
}

interface PasswordChangeFormProps {
    readonly mode: "reset" | "change";
    readonly currentPassword?: PasswordFieldProps;
    readonly newPassword: PasswordFieldProps;
    readonly confirmPassword: PasswordFieldProps;
    readonly feedback: FormFeedback | null;
    readonly isSubmitting: boolean;
    readonly isSubmitDisabled: boolean;
    readonly submitLabel: string;
    readonly onSubmit: () => void;
}
```

Validate (`VALIDATION_MESSAGES`):

| Trường hợp | Thông báo |
| :-- | :-- |
| Mật khẩu yếu | Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt |
| Quá 100 ký tự | Tối đa 100 ký tự |
| Nhập lại trống | Nhập lại mật khẩu |
| Nhập lại không khớp | Mật khẩu không khớp |
| Trùng mật khẩu hiện tại | Phải khác mật khẩu hiện tại |
| Thiếu mật khẩu hiện tại | Nhập mật khẩu hiện tại |
