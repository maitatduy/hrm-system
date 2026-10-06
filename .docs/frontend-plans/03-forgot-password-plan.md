# Kế hoạch frontend: quên mật khẩu

Nguồn: `.docs/ideas/03-forgot-password-idea.md`. Code: `frontend/src/features/auth/`.

## 1. Phân rã component

```
GuestRoute [SMART]
└── ForgotPasswordPage [DUMB]                 pages/ForgotPasswordPage.tsx
    └── AuthLayout > AuthCard [SHARED UI]
        ├── AuthHeader [DUMB]                  title="Quên mật khẩu"
        └── ForgotPasswordFormContainer [SMART]
            └── ForgotPasswordForm [DUMB]
                ├── FormFeedbackBanner [SHARED UI]     chỉ khi lỗi
                ├── FormField + TextInput [SHARED UI]  Email
                ├── Button [SHARED UI]                 Gửi mã
                └── BackToLoginLink [DUMB]             Quay lại đăng nhập
```

- `ForgotPasswordFormContainer`: React Hook Form + `forgotPasswordFormSchema`, gọi `useForgotPasswordMutation` (`POST /api/auth/forgot-password`). Thành công thì điều hướng ngay `/verify-otp?email=<email>`, không hiện thông báo trung gian.

## 2. Quản lý trạng thái

| State | Tầng |
| :-- | :-- |
| Email, lỗi validate | React Hook Form, giá trị đầu lấy từ `?email` |
| Lỗi server | `useState<FormFeedback \| null>` |
| Đang gửi | `useMutation().isPending` |

## 3. Cấu trúc dữ liệu

```ts
interface ForgotPasswordFormValues {
    email: string;
}

interface FormFeedback {
    readonly type: "success" | "error";
    readonly message: string;
}

interface ForgotPasswordFormProps {
    readonly register: UseFormRegister<ForgotPasswordFormValues>;
    readonly errors: FieldErrors<ForgotPasswordFormValues>;
    readonly feedback: FormFeedback | null;
    readonly isSubmitting: boolean;
    readonly onSubmit: () => void;
    readonly onClearFeedback: () => void;
}
```
