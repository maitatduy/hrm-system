# Kế hoạch frontend: màn hình đăng nhập

Nguồn: `.docs/ideas/01-login-idea.md`. Code: `frontend/src/features/auth/`.

## 1. Phân rã component

```
GuestRoute [SMART]
└── LoginPage [SMART]                         pages/LoginPage.tsx
    └── AuthLayout [DUMB] [SHARED UI]
        ├── CanvasBackground [DUMB] [SHARED UI]
        └── AuthCard [DUMB] [SHARED UI]
            ├── AuthHeader [DUMB]                       title="Đăng nhập"
            ├── FormFeedbackBanner [DUMB] [SHARED UI]   banner theo ?reason
            └── LoginFormContainer [SMART]
                └── LoginForm [DUMB]
                    ├── FormFeedbackBanner [SHARED UI]          lỗi server
                    ├── FormField + TextInput [SHARED UI]       Email
                    ├── FormField + PasswordInput [SHARED UI]   Mật khẩu
                    ├── Checkbox [SHARED UI]                    Ghi nhớ mật khẩu
                    ├── AuthLink [DUMB]                         Quên mật khẩu?
                    └── Button [SHARED UI]                      Đăng nhập
```

- `LoginFormContainer`: React Hook Form + `loginFormSchema` (zod), gọi `useLoginMutation`. Không tự điều hướng, `GuestRoute` chuyển trang khi `isAuthenticated` thành true.
- `useLoginMutation`: `POST /api/auth/login` kèm `rememberMe`, thành công thì `setAuth` (giữ access token trong bộ nhớ) và ghi cache `["auth", "me"]`. Backend dựa vào `rememberMe` để trả cookie refresh token lưu bền 7 ngày hoặc cookie phiên.
- `LoginPage`: đọc `?reason` (`logged_out`, `password_reset`, `password_changed`) để hiện banner, nội dung lấy từ `AUTH_MESSAGES` trong `src/constants/messages.ts`.

## 2. Quản lý trạng thái

| State | Tầng | Ghi chú |
| :-- | :-- | :-- |
| Giá trị form, lỗi validate | React Hook Form | |
| Lỗi từ server | `useState<string \| null>` | đóng được |
| Trạng thái gửi | `useMutation().isPending` | khóa form, nút chỉ hiện vòng quay |
| Phiên đăng nhập | Zustand | access token chỉ trong bộ nhớ, không ghi Web Storage; tải lại trang thì `restoreSession` gọi refresh bằng cookie HttpOnly, trạng thái `restoring` khiến `ProtectedRoute` và `GuestRoute` chờ |
| `reason`, `redirect` | URL query | |

## 3. Cấu trúc dữ liệu

```ts
interface LoginFormValues {
    email: string;
    password: string;
    rememberMe: boolean;
}

interface LoginRequest {
    readonly email: string;
    readonly password: string;
    readonly rememberMe: boolean;
}

interface LoginResponse {
    readonly accessToken: string;
    readonly tokenType: "Bearer";
    readonly user: AuthUserSession;
}

interface LoginFormProps {
    readonly register: UseFormRegister<LoginFormValues>;
    readonly errors: FieldErrors<LoginFormValues>;
    readonly serverError: string | null;
    readonly isSubmitting: boolean;
    readonly onSubmit: () => void;
    readonly onClearServerError: () => void;
}
```

Validate (`VALIDATION_MESSAGES`): email trống "Nhập email", sai định dạng "Email không hợp lệ", mật khẩu trống "Nhập mật khẩu".
