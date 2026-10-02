# Bản quy hoạch kỹ thuật Frontend: Đổi mật khẩu & Đặt lại mật khẩu (Change / Reset Password)

Tài liệu quy hoạch kỹ thuật cho chức năng Đổi mật khẩu và Đặt lại mật khẩu của hệ thống HRM System, tổng hợp và chuẩn hóa từ `.docs/ideas/05-change-password-idea.md`, các tiêu chuẩn giao diện tại `.docs/DESIGN.md`, kiến trúc hệ thống tại `.docs/ARCHITECTURE.md` và tiêu chuẩn kỹ thuật lập trình tại `.agent/rules/frontend-standards.md`.

Tính năng này được kiến trúc để **tái sử dụng tối đa logic và giao diện cho cả 2 ngữ cảnh nghiệp vụ**:
1. **Ngữ cảnh 1: Đặt lại mật khẩu (Reset Password - Unauthenticated)**: Người dùng hoàn tất xác thực OTP từ trang `/verify-otp`, được chuyển hướng tới `/reset-password?email=...&token=...` trong khung `AuthCardLayout`. Không cần nhập mật khẩu hiện tại.
2. **Ngữ cảnh 2: Tự đổi mật khẩu (Change Password - Authenticated)**: Nhân viên đã đăng nhập, tự chủ động đổi mật khẩu định kỳ tại trang Cài đặt tài khoản (`/settings` hoặc Dashboard section) trong Master Layout. Bắt buộc nhập mật khẩu hiện tại.

---

## 1. Phân rã component

### 1.1. Sơ đồ cây phân cấp component (Component Hierarchy)

#### Ngữ cảnh 1: Màn hình Đặt lại mật khẩu (`/reset-password`)
```
ResetPasswordPage [SMART]
└── AuthLayout [DUMB] [SHARED UI]
    ├── CanvasBackground [DUMB] [SHARED UI]
    └── AuthCard [DUMB] [SHARED UI]
        ├── AuthHeader [DUMB]
        │   ├── AppLogo [DUMB] [SHARED UI]
        │   ├── AuthTitle [DUMB]
        │   └── AuthSubtitle [DUMB]
        ├── ResetPasswordContainer [SMART]
        │   └── PasswordChangeForm [DUMB] [SHARED UI]
        │       ├── FormFeedbackBanner [DUMB] [SHARED UI]
        │       ├── FormField [DUMB] [SHARED UI] (New Password)
        │       │   └── PasswordInput [DUMB] [SHARED UI]
        │       ├── PasswordStrengthIndicator [DUMB] [SHARED UI]
        │       │   ├── PasswordRequirementItem [DUMB] [SHARED UI] (Tối thiểu 8 ký tự)
        │       │   ├── PasswordRequirementItem [DUMB] [SHARED UI] (Ít nhất 1 chữ in hoa)
        │       │   ├── PasswordRequirementItem [DUMB] [SHARED UI] (Ít nhất 1 chữ thường)
        │       │   ├── PasswordRequirementItem [DUMB] [SHARED UI] (Ít nhất 1 chữ số)
        │       │   └── PasswordRequirementItem [DUMB] [SHARED UI] (Ít nhất 1 ký tự đặc biệt)
        │       ├── FormField [DUMB] [SHARED UI] (Confirm Password)
        │       │   └── PasswordInput [DUMB] [SHARED UI]
        │       └── SubmitButton [DUMB] [SHARED UI]
        └── BackToLoginLink [DUMB]
```

#### Ngữ cảnh 2: Khu vực Đổi mật khẩu trong Cài đặt tài khoản (`Account Settings`)
```
AccountSettingsPage / DashboardShell [SMART]
└── SettingsCard [DUMB]
    ├── SettingsCardHeader [DUMB]
    │   ├── SettingsTitle [DUMB]
    │   └── SettingsDescription [DUMB]
    └── ChangePasswordContainer [SMART]
        └── PasswordChangeForm [DUMB] [SHARED UI]
            ├── FormFeedbackBanner [DUMB] [SHARED UI]
            ├── FormField [DUMB] [SHARED UI] (Current Password - Bắt buộc ở mode "change")
            │   └── PasswordInput [DUMB] [SHARED UI]
            ├── FormField [DUMB] [SHARED UI] (New Password)
            │   └── PasswordInput [DUMB] [SHARED UI]
            ├── PasswordStrengthIndicator [DUMB] [SHARED UI]
            │   ├── PasswordRequirementItem [DUMB] [SHARED UI] (Tối thiểu 8 ký tự)
            │   ├── PasswordRequirementItem [DUMB] [SHARED UI] (Ít nhất 1 chữ in hoa)
            │   ├── PasswordRequirementItem [DUMB] [SHARED UI] (Ít nhất 1 chữ thường)
            │   ├── PasswordRequirementItem [DUMB] [SHARED UI] (Ít nhất 1 chữ số)
            │   └── PasswordRequirementItem [DUMB] [SHARED UI] (Ít nhất 1 ký tự đặc biệt)
            ├── FormField [DUMB] [SHARED UI] (Confirm Password)
            │   └── PasswordInput [DUMB] [SHARED UI]
            └── FormActionsGroup [DUMB]
                ├── SecondaryButton [DUMB] [SHARED UI] (Hủy / Đặt lại form)
                └── SubmitButton [DUMB] [SHARED UI] (Lưu thay đổi)
```

---

### 1.2. Danh sách và phân loại chi tiết component

| Component | Phân loại | Khả năng tái sử dụng (Shared UI) | Trách nhiệm kỹ thuật & Ràng buộc Design Token |
| :--- | :--- | :--- | :--- |
| `ResetPasswordPage` | `[SMART]` | Không (Page Root) | Root component cho trang đặt lại mật khẩu độc lập ngoài Master Layout. Đọc `email` và `token` từ URL query params. Nếu thiếu param hợp lệ sẽ điều hướng an toàn về `/forgot-password`. |
| `ResetPasswordContainer` | `[SMART]` | Không (Feature Container) | Container kết nối dữ liệu cho ngữ cảnh Reset Password: khởi tạo React Hook Form với Zod schema (mode `reset`), gọi mutation `useResetPasswordMutation()`, điều phối hiển thị banner và điều hướng về `/login?reset=success` sau khi hoàn tất. |
| `ChangePasswordContainer` | `[SMART]` | Không (Feature Container) | Container kết nối dữ liệu cho ngữ cảnh Cài đặt tài khoản: khởi tạo React Hook Form với Zod schema (mode `change`), gọi mutation `useChangePasswordMutation()`, quản lý reset form sau khi cập nhật thành công. |
| `PasswordChangeForm` | `[DUMB]` | Có (`[SHARED UI]`) | Form dùng chung linh hoạt cho cả 2 ngữ cảnh thông qua prop `mode: "reset" \| "change"`. Khi `mode === "change"`, hiển thị thêm trường `currentPassword`. Nhúng trực tiếp `PasswordStrengthIndicator` dưới ô mật khẩu mới. Vô hiệu hóa nút Submit khi form chưa thỏa mãn điều kiện hoặc mật khẩu xác nhận không khớp. |
| `PasswordStrengthIndicator` | `[DUMB]` | Có (`[SHARED UI]`) | Khối hiển thị trực quan các điều kiện độ mạnh mật khẩu theo thời gian thực (real-time feedback). Nhận danh sách các tiêu chí đã kiểm tra và in ra UI theo dạng danh sách trợ giúp trực quan. |
| `PasswordRequirementItem` | `[DUMB]` | Có (`[SHARED UI]`) | Từng dòng tiêu chí kiểm tra độ mạnh mật khẩu. Khi đạt: icon tích xanh (`Check`) với màu `accent-green` (`#1aae39`). Khi chưa đạt: icon chấm tròn mờ (`Circle`) hoặc gạch đầu dòng với màu `ink-muted` (`#615d59`). Typography: `caption` (13px, weight 400). |
| `PasswordInput` | `[DUMB]` | Có (`[SHARED UI]`) | Thành phần input mật khẩu dùng chung đã có sẵn trong dự án: bo góc `rounded-xs` (4px), viền hairline `#e6e6e6`, focus primary `#0075de`, nút bật/tắt hiển thị mật khẩu bằng icon `Eye` / `EyeOff`. |
| `FormField` | `[DUMB]` | Có (`[SHARED UI]`) | Khối bọc trường nhập liệu gồm label (font 14px, đậm 500, màu `ink`), input child và thông báo lỗi validation (màu `accent-danger` `#dc2626`). |
| `FormFeedbackBanner` | `[DUMB]` | Có (`[SHARED UI]`) | Banner thông báo trạng thái kết quả (`success`, `error`), bo góc `rounded-xs` (4px), viền và chữ theo chuẩn semantic tokens (`#1aae39` hoặc `#dc2626`). |
| `SubmitButton` | `[DUMB]` | Có (`[SHARED UI]`) | Nút hành động chính: màu `primary` (`#0075de`), nhấn `#005bab`, bo góc **`rounded-full`**, hiển thị trạng thái loading spinner khi mutation đang chạy. |
| `SecondaryButton` | `[DUMB]` | Có (`[SHARED UI]`) | Nút hành động phụ (Hủy / Đặt lại form trong Settings): nền `#ffffff`, chữ `#000000`, viền hairline `#e6e6e6`, bo góc `rounded-md` (8px). |
| `AuthLayout` | `[DUMB]` | Có (`[SHARED UI]`) | Khung bọc giao diện trang xác thực ngoài Master Layout: `min-h-screen flex items-center justify-center p-4`. |
| `CanvasBackground` | `[DUMB]` | Có (`[SHARED UI]`) | Nền mềm toàn trang token `canvas-soft` (`#f6f5f4`). |
| `AuthCard` | `[DUMB]` | Có (`[SHARED UI]`) | Card trung tâm nền surface `#ffffff`, viền hairline `#e6e6e6`, bo góc `rounded-lg` (12px), padding `spacing-lg` (24px - 32px), bề rộng chuẩn `max-w-md w-full`. |
| `SettingsCard` | `[DUMB]` | Có (`[SHARED UI]`) | Khối card cấu hình trong Master Layout, nền surface `#ffffff`, viền hairline `#e6e6e6`, bo góc `rounded-lg` (12px), padding `spacing-lg` (24px). |
| `BackToLoginLink` | `[DUMB]` | Không | Liên kết điều hướng về trang `/login`, màu `primary` (`#0075de`), hover gạch chân. |

---

## 2. Quản lý trạng thái (State Management)

Hệ thống trạng thái cho tính năng Đổi/Đặt lại mật khẩu tuân thủ nghiêm ngặt mô hình phân tách 3 tầng của dự án kết hợp tham số URL:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TẦNG QUẢN LÝ TRẠNG THÁI                         │
├─────────────────────┬──────────────────────┬───────────────────────────┤
│ 1. LOCAL STATE      │ 2. SERVER STATE      │ 3. GLOBAL STATE           │
│ (Hook Form/useState)│ (TanStack Query)     │ (Zustand Store)           │
├─────────────────────┼──────────────────────┼───────────────────────────┤
│ - mode              │ - useResetPassword   │ - useAuthStore            │
│   ("reset"|"change")│   Mutation           │   (Chỉ đọc user info ở    │
│ - currentPassword   │   (POST /auth/       │    ngữ cảnh Change        │
│ - newPassword       │    reset-password)   │    Password; gọi logout   │
│ - confirmPassword   │ - useChangePassword  │    khi token bị thu hồi)  │
│ - requirementStatus │   Mutation           │ - KHÔNG dùng cho luồng    │
│   (real-time rules) │   (POST /auth/       │    Reset Password khách   │
│ - feedback state    │    change-password)  │                           │
└─────────────────────┴──────────────────────┴───────────────────────────┘
```

### 2.1. State cục bộ (Local State - `useState` & `React Hook Form`)

- **`mode` (`"reset" | "change"`)**:
  - Xác định ngữ cảnh hoạt động của form để bật/tắt trường `currentPassword` và áp dụng Zod schema tương ứng.
- **Form Values (`React Hook Form`)**:
  - `currentPassword`: Chuỗi mật khẩu cũ (chỉ theo dõi và bắt buộc khi `mode === "change"`).
  - `newPassword`: Chuỗi mật khẩu mới cần thiết lập.
  - `confirmPassword`: Chuỗi nhập lại mật khẩu mới để đối soát trùng khớp.
- **`watchedNewPassword` & `requirementStatus` (Real-time Password Validation)**:
  - Trạng thái được trích xuất thời gian thực bằng `watch("newPassword")` từ React Hook Form kết hợp hàm tiện ích `evaluatePasswordRequirements(password)`:
    1. `MIN_LENGTH`: Độ dài $\ge 8$ ký tự (`password.length >= 8`).
    2. `HAS_UPPERCASE`: Chứa ít nhất một chữ cái in hoa (`/[A-Z]/.test(password)`).
    3. `HAS_LOWERCASE`: Chứa ít nhất một chữ cái in thường (`/[a-z]/.test(password)`).
    4. `HAS_NUMBER`: Chứa ít nhất một chữ số (`/[0-9]/.test(password)`).
    5. `HAS_SPECIAL`: Chứa ít nhất một ký tự đặc biệt (`/[!@#$%^&*(),.?":{}|<>]/.test(password)`).
  - Trạng thái này cập nhật tức thì theo từng phím gõ, phản ánh trực tiếp lên `PasswordStrengthIndicator` mà không cần đợi người dùng bấm Submit.
- **`isFormValid`**:
  - Điều kiện kích hoạt nút Submit: Mọi tiêu chí độ mạnh đều `passed === true`, trường `newPassword === confirmPassword`, và (nếu `mode === "change"`) trường `currentPassword` không được để trống.
- **`feedback` (`{ type: "success" | "error"; message: string } | null`)**:
  - Quản lý thông báo lỗi (ví dụ: "Mật khẩu hiện tại không đúng", "Mã xác thực đã hết hạn") hoặc thông báo thành công sau khi gọi API.

---

### 2.2. State máy chủ (Server State - `TanStack Query`)

Toàn bộ thao tác mạng thực hiện qua axios instance tập trung kết nối với API Gateway.

#### A. Ngữ cảnh Reset Password (`useResetPasswordMutation`)
- **Endpoint**: `POST /api/v1/auth/reset-password`
- **Headers**: Không yêu cầu Bearer token (luồng unauthenticated).
- **Payload**:
  ```json
  {
    "email": "nhanvien@hrmcorp.vn",
    "resetToken": "eyJhGciOiJIUzI1NiIsInR5cCI6...",
    "newPassword": "NewSecurePassword@2026",
    "confirmPassword": "NewSecurePassword@2026"
  }
  ```
- **Xử lý kết quả**:
  - `isPending`: Vô hiệu hóa toàn bộ input và nút bấm, kích hoạt hiệu ứng spinner.
  - `onError`: Bắt lỗi HTTP 400/401/422, hiển thị banner thông báo lỗi semantic `accent-danger` ("Mã phiên đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. Vui lòng thử lại quy trình quên mật khẩu.").
  - `onSuccess`: Hiển thị banner thành công và tự động điều hướng sang `/login?reset=success` sau 1.5 giây.

#### B. Ngữ cảnh Change Password (`useChangePasswordMutation`)
- **Endpoint**: `POST /api/v1/auth/change-password`
- **Headers**: `Authorization: Bearer <accessToken>` (luồng authenticated trong Master Layout).
- **Payload**:
  ```json
  {
    "currentPassword": "CurrentPassword@2026",
    "newPassword": "NewSecurePassword@2026",
    "confirmPassword": "NewSecurePassword@2026"
  }
  ```
- **Xử lý kết quả**:
  - `onError`: Bắt lỗi HTTP 400 ("Mật khẩu hiện tại không chính xác") hoặc HTTP 422 ("Mật khẩu mới không được trùng với mật khẩu gần nhất").
  - `onSuccess`: Làm sạch form (`form.reset()`), hiển thị banner thông báo thành công `accent-green` ("Đổi mật khẩu thành công. Thông tin bảo mật tài khoản của bạn đã được cập nhật.").
  - **Không lưu server state này vào Zustand Store**.

---

### 2.3. State toàn cục (Global State - `Zustand`)

- **Đối với ngữ cảnh Reset Password**: **Tuyệt đối không sử dụng Zustand**. Luồng đặt lại mật khẩu thuộc về khách chưa đăng nhập, không tạo phiên làm việc.
- **Đối với ngữ cảnh Change Password (Settings)**:
  - Đọc `sessionUser` từ `useAuthStore` để xác định danh tính tài khoản đang thao tác.
  - Tuân thủ chiến lược bảo mật Refresh Token Rotation theo `.docs/ARCHITECTURE.md` (Mục 4.3): Khi người dùng đổi mật khẩu, backend sẽ hủy bỏ toàn bộ refresh token cũ trên Redis. Nếu chính sách hệ thống yêu cầu đăng nhập lại sau khi đổi mật khẩu, container gọi action `logout()` từ `useAuthStore` và điều hướng về `/login?reason=password_changed`.

---

### 2.4. Trạng thái tham số URL (URL Search Parameters)

- **Ngữ cảnh Reset Password (`/reset-password?email=...&token=...`)**:
  - **`email` (`string | null`)**: Định danh tài khoản cần đặt lại mật khẩu.
  - **`token` (`string | null`)**: Chuỗi `resetToken` một lần được cấp sau khi xác thực OTP thành công.
  - **Ràng buộc an toàn**: Nếu URL thiếu một trong hai tham số trên, container tự động kích hoạt điều hướng chuyển tiếp:
    - Thiếu `email` $\rightarrow$ Redirect về `/forgot-password`.
    - Thiếu `token` $\rightarrow$ Redirect về `/verify-otp?email=${encodeURIComponent(email)}`.
- **Ngữ cảnh Change Password (Settings)**:
  - Có thể nhận param tab điều hướng: `/settings?tab=security`.
  - **Tuyệt đối không đẩy mật khẩu hay token bảo mật lên URL query parameters**.

---

## 3. Cấu trúc dữ liệu & TypeScript Interfaces

Tuân thủ nghiêm ngặt quy định tại `.agent/rules/frontend-standards.md`: **tuyệt đối không sử dụng kiểu `any`**, toàn bộ trường dữ liệu và thuộc tính props dùng `readonly`.

### 3.1. Zod Validation Schemas & Form Types

```typescript
import { z } from "zod";

/**
 * Biểu thức Regex kiểm tra các tiêu chí mật khẩu chuẩn
 */
export const PASSWORD_REGEX = {
  HAS_UPPERCASE: /[A-Z]/,
  HAS_LOWERCASE: /[a-z]/,
  HAS_NUMBER: /[0-9]/,
  HAS_SPECIAL: /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\/]/,
} as const;

/**
 * Zod schema cho mật khẩu mới dùng chung
 */
export const newPasswordValidationRule = z
  .string()
  .min(8, "Mật khẩu phải có tối thiểu 8 ký tự")
  .regex(PASSWORD_REGEX.HAS_UPPERCASE, "Mật khẩu phải chứa ít nhất 1 chữ cái in hoa")
  .regex(PASSWORD_REGEX.HAS_LOWERCASE, "Mật khẩu phải chứa ít nhất 1 chữ cái in thường")
  .regex(PASSWORD_REGEX.HAS_NUMBER, "Mật khẩu phải chứa ít nhất 1 chữ số")
  .regex(PASSWORD_REGEX.HAS_SPECIAL, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt");

/**
 * Schema cho Ngữ cảnh 1: Đặt lại mật khẩu sau OTP (Reset Password)
 */
export const resetPasswordSchema = z
  .object({
    newPassword: newPasswordValidationRule,
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không trùng khớp",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Schema cho Ngữ cảnh 2: Tự đổi mật khẩu trong Cài đặt (Change Password)
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: newPasswordValidationRule,
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không trùng khớp",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Mật khẩu mới không được trùng với mật khẩu hiện tại",
    path: ["newPassword"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

/**
 * Kiểu dữ liệu tổng hợp cho form dùng chung
 */
export type PasswordChangeFormFields = {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
};
```

---

### 3.2. API DTOs (Data Transfer Objects)

```typescript
/**
 * Request payload cho API Đặt lại mật khẩu: POST /api/v1/auth/reset-password
 */
export interface ResetPasswordRequest {
  readonly email: string;
  readonly resetToken: string;
  readonly newPassword: string;
  readonly confirmPassword: string;
}

/**
 * Response payload khi đặt lại mật khẩu thành công
 */
export interface ResetPasswordResponse {
  readonly success: boolean;
  readonly message: string;
}

/**
 * Request payload cho API Tự đổi mật khẩu: POST /api/v1/auth/change-password
 */
export interface ChangePasswordRequest {
  readonly currentPassword: string;
  readonly newPassword: string;
  readonly confirmPassword: string;
}

/**
 * Response payload khi đổi mật khẩu thành công
 */
export interface ChangePasswordResponse {
  readonly success: boolean;
  readonly message: string;
}

/**
 * Trạng thái thông báo phản hồi (Feedback Message)
 */
export interface PasswordFormFeedback {
  readonly type: "success" | "error" | "info";
  readonly message: string;
}
```

---

### 3.3. Interfaces cho các Tiêu chuẩn độ mạnh mật khẩu (Password Strength Rules)

```typescript
/**
 * Định danh các tiêu chí kiểm tra độ mạnh mật khẩu
 */
export type PasswordRuleId =
  | "min-length"
  | "has-uppercase"
  | "has-lowercase"
  | "has-number"
  | "has-special";

/**
 * Định nghĩa một tiêu chí kiểm tra và trạng thái hiện tại
 */
export interface PasswordRequirement {
  readonly id: PasswordRuleId;
  readonly label: string;
  readonly isMet: boolean;
}

/**
 * Props cho component PasswordRequirementItem (Từng dòng tiêu chuẩn)
 */
export interface PasswordRequirementItemProps {
  readonly requirement: PasswordRequirement;
  readonly className?: string;
}

/**
 * Props cho component PasswordStrengthIndicator (Cụm danh sách tiêu chuẩn)
 */
export interface PasswordStrengthIndicatorProps {
  readonly requirements: readonly PasswordRequirement[];
  readonly className?: string;
}
```

---

### 3.4. Props Interfaces cho các Dumb Components quan trọng

```typescript
import type { UseFormRegisterReturn } from "react-hook-form";

/**
 * Chế độ hoạt động của Form
 */
export type PasswordFormMode = "reset" | "change";

/**
 * Props cho Dumb Component cốt lõi: PasswordChangeForm
 */
export interface PasswordChangeFormProps {
  readonly mode: PasswordFormMode;
  readonly registerCurrentPassword?: UseFormRegisterReturn;
  readonly registerNewPassword: UseFormRegisterReturn;
  readonly registerConfirmPassword: UseFormRegisterReturn;
  readonly currentPasswordError?: string;
  readonly newPasswordError?: string;
  readonly confirmPasswordError?: string;
  readonly requirements: readonly PasswordRequirement[];
  readonly isSubmitDisabled: boolean;
  readonly isSubmitting: boolean;
  readonly feedback: PasswordFormFeedback | null;
  readonly onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  readonly onCancel?: () => void;
  readonly submitButtonText?: string;
  readonly className?: string;
}

/**
 * Props cho SettingsCard (Card bọc trong Master Layout)
 */
export interface SettingsCardProps {
  readonly title: string;
  readonly description?: string;
  readonly children: React.ReactNode;
  readonly className?: string;
}

/**
 * Props cho Container ResetPasswordContainer
 */
export interface ResetPasswordContainerProps {
  readonly email: string;
  readonly resetToken: string;
  readonly onSuccessRedirect?: (loginUrl: string) => void;
}

/**
 * Props cho Container ChangePasswordContainer
 */
export interface ChangePasswordContainerProps {
  readonly onSuccess?: () => void;
  readonly onCancel?: () => void;
}
```

---

## 4. Kế hoạch triển khai & Ràng buộc bảo mật (Security & UX Checklist)

1. **Tuân thủ triệt để Design Tokens (`DESIGN.md`)**:
   - Nền toàn trang: `canvas-soft` (`#f6f5f4`).
   - Thẻ bao bọc: `AuthCard` và `SettingsCard` đều dùng nền `surface` (`#ffffff`), viền hairline `#e6e6e6`, bo góc `rounded-lg` (12px), đệm trong `spacing-lg` (24px).
   - Ô nhập mật khẩu: Dùng `PasswordInput` chuẩn bo góc **`rounded-xs` (4px)**, viền hairline, trạng thái focus viền `primary` (`#0075de`).
   - Nút xác nhận chính: Bo góc **`rounded-full`**, màu nền `primary` (`#0075de`), trạng thái hover/active `#005bab`.
   - Nút hủy phụ (trong Settings): Bo góc **`rounded-md` (8px)**, viền hairline `#e6e6e6`, nền `#ffffff`.
   - Trạng thái thành công: Màu `accent-green` (`#1aae39`) cho các tiêu chí độ mạnh đã đạt và banner thành công.
   - Trạng thái lỗi/cảnh báo: Màu `accent-danger` (`#dc2626`) cho thông báo lỗi validation và banner thất bại.

2. **Quy tắc trải nghiệm người dùng theo thời gian thực (Real-time UX Rules)**:
   - Danh sách điều kiện độ mạnh mật khẩu hiển thị ngay dưới ô mật khẩu mới.
   - Khi người dùng bắt đầu nhập mật khẩu, các tiêu chí kiểm tra (`PasswordRequirementItem`) lập tức đổi trạng thái:
     - Chưa đạt: Icon chấm tròn mờ `Circle` kèm màu chữ `ink-muted` (`#615d59`).
     - Đã đạt: Icon dấu tích `Check` kèm màu chữ `accent-green` (`#1aae39`).
   - Nút "Lưu thay đổi" / "Đặt lại mật khẩu" bị vô hiệu hóa (`disabled`) cho tới khi thỏa mãn đồng thời:
     - Toàn bộ 5 tiêu chí đều đạt chuẩn.
     - Ô xác nhận mật khẩu có giá trị và trùng khớp tuyệt đối với mật khẩu mới.
     - Ô mật khẩu hiện tại được điền (nếu ở chế độ `change`).

3. **Ràng buộc an toàn thông tin & Kiến trúc Microservices (`ARCHITECTURE.md`)**:
   - Mật khẩu chỉ truyền qua HTTPS trong phần thân JSON (POST body), tuyệt đối không gắn vào query string hay console log.
   - Mặc định ẩn ký tự bằng dấu chấm (`type="password"`), cho phép người dùng click icon con mắt để kiểm tra lại trước khi gửi.
   - Khi đặt lại mật khẩu thành công qua luồng OTP, xóa sạch `resetToken` trong bộ nhớ cục bộ để ngăn chặn tấn công phát lại (Replay Attack).
   - Ở luồng đổi mật khẩu trong Cài đặt, sau khi API trả về mã 200, hệ thống tuân thủ cơ chế Refresh Token Rotation: vô hiệu hóa toàn bộ session cũ trên Redis để đảm bảo an toàn tuyệt đối.

4. **Kế hoạch kiểm thử tự động (Testing Matrix)**:
   - **Real-time Validator Test**: Kiểm tra danh sách rules cập nhật chính xác theo từng chuỗi ký tự nhập vào (ví dụ: `abc` $\rightarrow$ chỉ đạt thường; `Abc123!@` $\rightarrow$ đạt đủ 5 tiêu chí).
   - **Password Match Test**: Kiểm tra lỗi "Mật khẩu xác nhận không trùng khớp" khi 2 ô có nội dung khác nhau.
   - **Disabled Submit Button Test**: Kiểm tra nút bấm không thể click khi form chưa đạt đủ điều kiện an toàn.
   - **URL Security Guard Test**: Kiểm tra truy cập trực tiếp `/reset-password` khi thiếu `email` hoặc `token` sẽ tự động redirect về trang an toàn trước đó.
