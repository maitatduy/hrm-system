# Bản quy hoạch kỹ thuật Frontend: Màn hình Đăng nhập (Login)

Tài liệu quy hoạch kỹ thuật cho màn hình Đăng nhập (`LoginPage`) của hệ thống HRM System, tích hợp các ràng buộc từ `.docs/ideas/01-login-idea.md`, `.docs/DESIGN.md`, `.agent/rules/frontend-standards.md`, và `.docs/ARCHITECTURE.md`.

---

## 1. Phân rã component

### 1.1. Sơ đồ cây phân cấp component (Component Hierarchy)

```
LoginPage [SMART]
└── AuthLayout [DUMB] [SHARED UI]
    ├── CanvasBackground [DUMB] [SHARED UI]
    └── AuthCard [DUMB] [SHARED UI]
        ├── AuthHeader [DUMB]
        │   ├── AppLogo [DUMB] [SHARED UI]
        │   ├── AuthTitle [DUMB]
        │   └── AuthSubtitle [DUMB]
        ├── LoginFormContainer [SMART]
        │   └── LoginForm [DUMB]
        │       ├── FormErrorMessageBanner [DUMB] [SHARED UI]
        │       ├── FormField [DUMB] [SHARED UI]
        │       │   └── TextInput [DUMB] [SHARED UI]
        │       ├── FormField [DUMB] [SHARED UI]
        │       │   └── PasswordInput [DUMB] [SHARED UI]
        │       ├── LoginOptionsRow [DUMB]
        │       │   ├── RememberMeCheckbox [DUMB] [SHARED UI]
        │       │   └── ForgotPasswordLink [DUMB]
        │       └── SubmitButton [DUMB] [SHARED UI]
        └── AuthFooter [DUMB]
```

### 1.2. Danh sách và phân loại chi tiết component

| Component                | Phân loại | Khả năng tái sử dụng (Shared UI) | Trách nhiệm kỹ thuật & Ràng buộc Design Token                                                                                                                                                                                              |
| :----------------------- | :-------- | :------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LoginPage`              | `[SMART]` | Không (Page Root)                | Độc lập ngoài Master Layout. Đọc `redirect` param từ URL, điều phối mutation đăng nhập, điều hướng người dùng theo vai trò (`UserRole`) sau khi xác thực thành công.                                                                       |
| `AuthLayout`             | `[DUMB]`  | Có (`[SHARED UI]`)               | Khung bọc giao diện xác thực (dùng chung cho Login, Forgot Password, Reset Password). Căn giữa nội dung toàn màn hình (`min-h-screen flex items-center justify-center`).                                                                   |
| `CanvasBackground`       | `[DUMB]`  | Có (`[SHARED UI]`)               | Lớp nền bao phủ toàn trang, sử dụng token màu `canvas-soft` (`#f6f5f4`).                                                                                                                                                                   |
| `AuthCard`               | `[DUMB]`  | Có (`[SHARED UI]`)               | Khối card chứa form, nền surface `#ffffff`, viền hairline `#e6e6e6`, bo góc `rounded-lg` (12px), đệm trong `spacing-lg` (24px), độ rộng tối đa chuẩn `max-w-md w-full`.                                                                    |
| `AuthHeader`             | `[DUMB]`  | Không                            | Vùng đầu card căn giữa, chứa Logo, Tiêu đề và Mô tả ngắn. Khoảng cách dưới `spacing-md` (16px).                                                                                                                                            |
| `AppLogo`                | `[DUMB]`  | Có (`[SHARED UI]`)               | Hiển thị logo nhận diện hệ thống HRM với kích thước chuẩn tỷ lệ, căn giữa.                                                                                                                                                                 |
| `AuthTitle`              | `[DUMB]`  | Không                            | Tiêu đề card "Đăng nhập hệ thống", font `heading-3` (22px, đậm 700), màu chữ `ink` (`#000000`).                                                                                                                                            |
| `AuthSubtitle`           | `[DUMB]`  | Không                            | Đoạn mô tả phụ hướng dẫn ngắn gọn, font `body-sm` (14px, 400), màu chữ `ink-muted` (`#615d59`).                                                                                                                                            |
| `LoginFormContainer`     | `[SMART]` | Không                            | Khởi tạo form với React Hook Form và Zod resolver; gọi custom hook mutation TanStack Query (`useLoginMutation`); quản lý state lỗi xác thực chung từ server.                                                                               |
| `LoginForm`              | `[DUMB]`  | Không                            | Form thuần UI, nhận `formState`, `register`, `handleSubmit`, `errors` để render các trường nhập liệu; khoảng cách giữa các trường là `spacing-md` (16px).                                                                                  |
| `FormErrorMessageBanner` | `[DUMB]`  | Có (`[SHARED UI]`)               | Banner thông báo lỗi xác thực chung khi server từ chối đăng nhập. Màu chữ và viền dùng `accent-danger` (`#dc2626`), nền mờ 5%, bo góc `rounded-xs` (4px). **Tuyệt đối không tiết lộ trường cụ thể sai**.                                   |
| `FormField`              | `[DUMB]`  | Có (`[SHARED UI]`)               | Bọc label (`body-sm`, font 500, màu `ink`), input control và message lỗi validation cục bộ của từng trường.                                                                                                                                |
| `TextInput`              | `[DUMB]`  | Có (`[SHARED UI]`)               | Input văn bản cho Email. Nền surface `#ffffff`, viền hairline `#e6e6e6`, bo góc **`rounded-xs` (4px)** theo đúng DESIGN.md. Khi focus: viền chuyển sang primary `#0075de`.                                                                 |
| `PasswordInput`          | `[DUMB]`  | Có (`[SHARED UI]`)               | Input mật khẩu có nút icon mắt toggle ẩn/hiện mật khẩu. Nền surface `#ffffff`, bo góc **`rounded-xs` (4px)**, viền hairline `#e6e6e6`.                                                                                                     |
| `LoginOptionsRow`        | `[DUMB]`  | Không                            | Hàng ngang chứa checkbox "Ghi nhớ đăng nhập" và link "Quên mật khẩu?", căn đều 2 bên (`flex justify-between items-center`).                                                                                                                |
| `RememberMeCheckbox`     | `[DUMB]`  | Có (`[SHARED UI]`)               | Checkbox bo góc `rounded-xs` (4px), màu khi checked dùng primary `#0075de`, label font `body-sm` màu `ink-secondary` (`#31302e`).                                                                                                          |
| `ForgotPasswordLink`     | `[DUMB]`  | Không                            | Link điều hướng sang `/forgot-password`, chữ `body-sm`, màu primary `#0075de`, hover gạch chân nhẹ.                                                                                                                                        |
| `SubmitButton`           | `[DUMB]`  | Có (`[SHARED UI]`)               | Nút submit full chiều rộng (`w-full`), màu nền primary `#0075de` (active/pressed `#005bab`), chữ trắng `heading-3`/`body-md` bold, bo góc **`rounded-full`** theo quy chuẩn nút chính tại DESIGN.md. Hỗ trợ hiển thị spinner khi đang tải. |
| `AuthFooter`             | `[DUMB]`  | Không                            | Chân card chứa thông tin hỗ trợ kỹ thuật hoặc số phiên bản hệ thống, chữ màu `ink-faint` (`#a39e98`), font `caption` (12px).                                                                                                               |

---

## 2. Quản lý trạng thái (State Management)

Hệ thống trạng thái cho tính năng Đăng nhập tuân thủ chặt chẽ 3 tầng kiến trúc, kết hợp URL parameter:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TẦNG QUẢN LÝ TRẠNG THÁI                         │
├─────────────────────┬──────────────────────┬───────────────────────────┤
│ 1. LOCAL STATE      │ 2. SERVER STATE      │ 3. GLOBAL STATE           │
│ (Hook Form/useState)│ (TanStack Query)     │ (Zustand Store)           │
├─────────────────────┼──────────────────────┼───────────────────────────┤
│ - email, password,  │ - useLoginMutation   │ - accessToken             │
│   rememberMe        │   (POST /auth/login) │ - isAuthenticated         │
│ - isPasswordVisible │ - isPending status   │ - userBasicInfo (session) │
│ - client validation │ - server auth error  │                           │
└─────────────────────┴──────────────────────┴───────────────────────────┘
```

### 2.1. State cục bộ (Local State - `useState` & `React Hook Form`)

Áp dụng cho trạng thái nhập liệu tương tác tức thì trên giao diện của trang:

- **Form State (`React Hook Form` + Zod)**:
  - `email` (`string`): Địa chỉ email đăng nhập của người dùng.
  - `password` (`string`): Mật khẩu người dùng.
  - `rememberMe` (`boolean`): Cờ tuỳ chọn lưu phiên đăng nhập lâu dài.
  - Quản lý trạng thái `isSubmitting`, `isValid`, `touchedFields`.
- **Client Validation Errors (`Zod`)**:
  - Lỗi định dạng email không đúng format RFC tiêu chuẩn.
  - Lỗi trường bắt buộc khi để trống email hoặc mật khẩu.
- **`isPasswordVisible` (`boolean`)**:
  - Quản lý qua `useState(false)` tại `PasswordInput`.
  - Kiểm soát chuyển đổi thuộc tính `type="password"` sang `type="text"`.

### 2.2. State máy chủ (Server State - `TanStack Query`)

Dữ liệu xác thực từ API Gateway được thực thi qua Mutation, **không lưu trữ data thô từ API trực tiếp vào Zustand**:

- **`useLoginMutation()`**:
  - Endpoint: `POST /api/v1/auth/login` (qua instance axios tập trung tại `lib/axios`).
  - Payload: `{ email, password, rememberMe }`.
  - Phản hồi thành công: `{ accessToken, refreshToken, tokenType, expiresIn, user: { id, employeeId, fullName, email, roles } }`.
  - Trạng thái phản hồi:
    - `isPending`: Bật hiệu ứng loading spinner trên `SubmitButton` và vô hiệu hóa (`disabled`) toàn bộ input để chống double-submit.
    - `error`: Lỗi HTTP 401 hoặc 400 được trích xuất thành thông điệp chung: _"Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại."_ Hiển thị qua `FormErrorMessageBanner`.
  - Khi thành công (`onSuccess`):
    - Gửi `accessToken` vào `useAuthStore` (Global State).
    - Khởi tạo lại cache TanStack Query nếu cần: `queryClient.setQueryData(['auth', 'me'], data.user)`.
    - Điều hướng người dùng dựa vào URL redirect param hoặc phân quyền vai trò.

### 2.3. State toàn cục (Global Client State - `Zustand`)

Chỉ lưu trữ token xác thực và cờ phiên tối giản phục vụ cơ chế Interceptor của Axios và Guard Route:

- **`useAuthStore`**:
  - `accessToken` (`string | null`): Chuỗi JWT token được gắn vào header `Authorization: Bearer <token>` của mọi HTTP request tiếp theo qua API Gateway.
  - `isAuthenticated` (`boolean`): Cờ đánh dấu người dùng đã đăng nhập hợp lệ.
  - `actions`:
    - `setAuth(payload: { accessToken: string; user: AuthUserSession })`: Cập nhật trạng thái đăng nhập.
    - `clearAuth()`: Xóa sạch phiên đăng nhập khi token hết hạn hoặc đăng xuất.
- **Quy tắc phân tách**: Dữ liệu hồ sơ người dùng chi tiết (phòng ban, chức vụ, ngày vào làm) vẫn được quản lý và fetch bởi query `['auth', 'me']` của TanStack Query tại Master Layout, không bị duplicate trong Zustand.

### 2.4. Trạng thái tham số URL (URL Search Parameters)

- **`redirect` (`string | null`)**:
  - Trích xuất thông qua `useSearchParams()`.
  - Lưu trữ đường dẫn trước đó mà người dùng chưa xác thực cố gắng truy cập (ví dụ: `/login?redirect=%2Fleave-requests%2Fdetail%2F123`).
  - Sau khi đăng nhập thành công:
    - Nếu có `redirect` hợp lệ và an toàn (cùng origin/internal route): Điều hướng trực tiếp tới `redirect`.
    - Nếu không có: Điều hướng về Dashboard tương ứng với role:
      - `ADMIN` & `HR` $\rightarrow$ `/dashboard`
      - `MANAGER` $\rightarrow$ `/management/dashboard`
      - `EMPLOYEE` $\rightarrow$ `/portal/dashboard`

---

## 3. Cấu trúc dữ liệu & TypeScript Interfaces

Tuân thủ nghiêm ngặt chuẩn `frontend-standards.md`, **tuyệt đối không sử dụng kiểu `any`**.

### 3.1. Schema & Kiểu dữ liệu xác thực (Auth Types & Zod Schema)

```typescript
import { z } from "zod";

/**
 * Vai trò người dùng trong hệ thống theo ARCHITECTURE.md
 */
export type UserRole = "ADMIN" | "HR" | "MANAGER" | "EMPLOYEE";

/**
 * Zod validation schema cho form đăng nhập
 */
export const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập địa chỉ email")
    .email("Định dạng email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
  rememberMe: z.boolean().default(false),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

/**
 * DTO gửi lên API Gateway POST /api/v1/auth/login
 */
export interface LoginRequest {
  readonly email: string;
  readonly password: string;
  readonly rememberMe: boolean;
}

/**
 * Thông tin user cơ bản đính kèm phản hồi đăng nhập
 */
export interface AuthUserSession {
  readonly id: string;
  readonly employeeId: string;
  readonly fullName: string;
  readonly email: string;
  readonly roles: readonly UserRole[];
}

/**
 * DTO phản hồi trả về từ API Gateway
 */
export interface LoginResponse {
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly tokenType: "Bearer";
  readonly expiresIn: number;
  readonly user: AuthUserSession;
}
```

### 3.2. Cấu trúc Props cho các Dumb Components cốt lõi

```typescript
import type { ReactNode } from "react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";

/**
 * Props cho AuthLayout (Shared UI)
 */
export interface AuthLayoutProps {
  readonly children: ReactNode;
  readonly className?: string;
}

/**
 * Props cho AuthCard (Shared UI)
 */
export interface AuthCardProps {
  readonly children: ReactNode;
  readonly className?: string;
}

/**
 * Props cho FormErrorMessageBanner (Shared UI)
 */
export interface FormErrorMessageBannerProps {
  readonly message: string | null;
  readonly onClose?: () => void;
}

/**
 * Props cho TextInput (Shared UI)
 * Bo góc: rounded-xs (4px)
 */
export interface TextInputProps {
  readonly id: string;
  readonly label: string;
  readonly type?: "text" | "email";
  readonly placeholder?: string;
  readonly error?: string;
  readonly disabled?: boolean;
  readonly registration: ReturnType<UseFormRegister<LoginFormData>>;
}

/**
 * Props cho PasswordInput (Shared UI)
 * Bo góc: rounded-xs (4px)
 */
export interface PasswordInputProps {
  readonly id: string;
  readonly label: string;
  readonly placeholder?: string;
  readonly error?: string;
  readonly disabled?: boolean;
  readonly registration: ReturnType<UseFormRegister<LoginFormData>>;
}

/**
 * Props cho RememberMeCheckbox (Shared UI)
 */
export interface RememberMeCheckboxProps {
  readonly id: string;
  readonly label: string;
  readonly disabled?: boolean;
  readonly registration: ReturnType<UseFormRegister<LoginFormData>>;
}

/**
 * Props cho SubmitButton (Shared UI)
 * Nút chính: màu primary #0075de, bo góc rounded-full
 */
export interface SubmitButtonProps {
  readonly children: ReactNode;
  readonly isLoading: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
}

/**
 * Props cho LoginForm (Dumb Presentational Form)
 */
export interface LoginFormProps {
  readonly register: UseFormRegister<LoginFormData>;
  readonly errors: FieldErrors<LoginFormData>;
  readonly serverError: string | null;
  readonly isSubmitting: boolean;
  readonly onSubmit: () => void;
}
```

### 3.3. Đặc tả Store Zustand (`useAuthStore`)

```typescript
export interface AuthState {
  readonly accessToken: string | null;
  readonly isAuthenticated: boolean;
  readonly sessionUser: AuthUserSession | null;
  readonly setAuth: (payload: {
    accessToken: string;
    user: AuthUserSession;
  }) => void;
  readonly clearAuth: () => void;
}
```

---

## 4. Kế hoạch triển khai & Kiểm thử (Checklist)

1. **Khởi tạo Shared UI Primitives**:
   - `TextInput` & `PasswordInput`: Áp dụng viền hairline `#e6e6e6`, bo góc **`rounded-xs` (4px)**.
   - `SubmitButton`: Bo góc **`rounded-full`**, màu `#0075de`, active `#005bab`, tích hợp spinner SVG.
   - `FormErrorMessageBanner`: Sử dụng màu `accent-danger` (`#dc2626`) cho border/text và nền đỏ nhạt.
2. **Xây dựng Form Validation & Mutation**:
   - Tích hợp `react-hook-form` với `@hookform/resolvers/zod`.
   - Viết hook `useLoginMutation` bằng `useMutation` của TanStack Query, bọc axios instance trỏ đến API Gateway `/api/v1/auth/login`.
3. **Hiện thực Security UX**:
   - Đảm bảo lỗi từ server (401/400) luôn quy về một thông báo chung không tiết lộ email có tồn tại hay không.
   - Vô hiệu hóa controls khi `isPending = true` để ngăn chặn request trùng lặp.
4. **Kiểm thử tự động (Unit & Integration Tests)**:
   - **Form Validation Test**: Kiểm tra báo lỗi khi nhập sai định dạng email hoặc bỏ trống mật khẩu.
   - **Password Toggle Test**: Kiểm tra nhấn icon con mắt chuyển đổi đúng thuộc tính `type="password"` $\leftrightarrow$ `type="text"`.
   - **Generic Error Test**: Đảm bảo phản hồi thất bại từ server hiển thị banner `accent-danger` với nội dung không chỉ rõ email hay password.
   - **Role-based Redirection Test**: Giả lập đăng nhập thành công với vai trò `EMPLOYEE` và `ADMIN`, kiểm tra điều hướng đúng route chỉ định.
