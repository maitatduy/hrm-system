# Bản quy hoạch kỹ thuật Frontend: Màn hình Quên mật khẩu (Forgot Password)

Tài liệu quy hoạch kỹ thuật cho màn hình Quên mật khẩu (`ForgotPasswordPage`) của hệ thống HRM System, tích hợp các yêu cầu từ `.docs/ideas/03-forgot-password-idea.md`, các quy chuẩn thiết kế tại `.docs/DESIGN.md`, kiến trúc hệ thống tại `.docs/ARCHITECTURE.md` và tiêu chuẩn lập trình tại `.agent/rules/frontend-standards.md`.

---

## 1. Phân rã component

### 1.1. Sơ đồ cây phân cấp component (Component Hierarchy)

```
ForgotPasswordPage [SMART]
└── AuthLayout [DUMB] [SHARED UI]
    ├── CanvasBackground [DUMB] [SHARED UI]
    └── AuthCard [DUMB] [SHARED UI]
        ├── AuthHeader [DUMB]
        │   ├── AppLogo [DUMB] [SHARED UI]
        │   ├── AuthTitle [DUMB]
        │   └── AuthSubtitle [DUMB]
        ├── ForgotPasswordFormContainer [SMART]
        │   └── ForgotPasswordForm [DUMB]
        │       ├── FormFeedbackBanner [DUMB] [SHARED UI]
        │       ├── FormField [DUMB] [SHARED UI]
        │       │   └── TextInput [DUMB] [SHARED UI]
        │       ├── SubmitButton [DUMB] [SHARED UI]
        │       └── BackToLoginLink [DUMB]
        └── AuthFooter [DUMB]
```

### 1.2. Danh sách và phân loại chi tiết component

| Component                     | Phân loại | Khả năng tái sử dụng (Shared UI) | Trách nhiệm kỹ thuật & Ràng buộc Design Token |
| :---------------------------- | :-------- | :------------------------------- | :-------------------------------------------- |
| `ForgotPasswordPage`          | `[SMART]` | Không (Page Root)                | Component trang gốc độc lập ngoài Master Layout. Đọc query param `email` từ URL (nếu có), quản lý điều hướng sang màn hình xác thực OTP (`/reset-password?email=...`) sau khi gửi yêu cầu thành công. |
| `AuthLayout`                  | `[DUMB]`  | Có (`[SHARED UI]`)               | Khung bọc giao diện xác thực (dùng chung cho Login, Forgot Password, Reset Password). Căn giữa nội dung toàn màn hình (`min-h-screen flex items-center justify-center`). |
| `CanvasBackground`            | `[DUMB]`  | Có (`[SHARED UI]`)               | Lớp nền bao phủ toàn trang, sử dụng token màu `canvas-soft` (`#f6f5f4`). |
| `AuthCard`                    | `[DUMB]`  | Có (`[SHARED UI]`)               | Khối card trung tâm, nền surface `#ffffff`, viền hairline `#e6e6e6`, bo góc `rounded-lg` (12px), đệm trong `spacing-lg` (24px), độ rộng tối đa chuẩn `max-w-md w-full`. |
| `AuthHeader`                  | `[DUMB]`  | Không                            | Vùng đầu card căn giữa, chứa Logo, Tiêu đề và Mô tả ngắn. Khoảng cách dưới `spacing-md` (16px). |
| `AppLogo`                     | `[DUMB]`  | Có (`[SHARED UI]`)               | Hiển thị logo nhận diện hệ thống HRM với kích thước chuẩn tỷ lệ, căn giữa. |
| `AuthTitle`                   | `[DUMB]`  | Không                            | Tiêu đề card "Quên mật khẩu", font `heading-3` (22px, đậm 700), màu chữ `ink` (`#000000`). |
| `AuthSubtitle`                | `[DUMB]`  | Không                            | Đoạn mô tả phụ hướng dẫn người dùng: "Nhập email liên kết với tài khoản của bạn để nhận mã xác thực OTP khôi phục mật khẩu.", font `body-sm` (14px, 400), màu chữ `ink-muted` (`#615d59`). |
| `ForgotPasswordFormContainer` | `[SMART]` | Không                            | Khởi tạo form với `react-hook-form` và Zod schema; gọi custom hook mutation TanStack Query (`useForgotPasswordMutation`); quản lý state phản hồi chung từ server và xử lý điều hướng. |
| `ForgotPasswordForm`          | `[DUMB]`  | Không                            | Form thuần UI, nhận `formState`, `register`, `handleSubmit`, `errors`, `serverFeedback` để render các trường nhập liệu; khoảng cách giữa các trường là `spacing-md` (16px). |
| `FormFeedbackBanner`          | `[DUMB]`  | Có (`[SHARED UI]`)               | Banner thông báo đa năng (hỗ trợ variant `success`, `error`, `info`). Khi báo thành công dùng viền/chữ `accent-green` (`#1aae39`); khi báo lỗi rate-limit dùng `accent-danger` (`#dc2626`); nền mờ 5%, bo góc `rounded-xs` (4px). |
| `FormField`                   | `[DUMB]`  | Có (`[SHARED UI]`)               | Bọc nhãn (`body-sm`, font 500, màu `ink`), input control và message lỗi validation cục bộ của từng trường. |
| `TextInput`                   | `[DUMB]`  | Có (`[SHARED UI]`)               | Input văn bản cho Email. Nền surface `#ffffff`, viền hairline `#e6e6e6`, bo góc `rounded-xs` (4px). Khi focus: viền chuyển sang primary `#0075de`. Hiển thị lỗi validation ngay dưới input khi không hợp lệ. |
| `SubmitButton`                | `[DUMB]`  | Có (`[SHARED UI]`)               | Nút submit full chiều rộng (`w-full`), màu nền primary `#0075de` (active/pressed `#005bab`), chữ trắng `heading-3`/`body-md` bold, bo góc `rounded-full` (theo quy chuẩn nút chính tại DESIGN.md). Tích hợp spinner khi đang tải. |
| `BackToLoginLink`             | `[DUMB]`  | Không                            | Liên kết điều hướng quay về `/login`, bao gồm icon mũi tên quay lại, chữ `body-sm`, màu `ink-secondary` (`#31302e`) hoặc primary `#0075de`, hover gạch chân nhẹ, căn giữa dưới nút submit. |
| `AuthFooter`                  | `[DUMB]`  | Không                            | Chân card chứa thông tin hỗ trợ kỹ thuật nội bộ hoặc bản quyền hệ thống, chữ màu `ink-faint` (`#a39e98`), font `caption` (12px). |

---

## 2. Quản lý trạng thái (State Management)

Hệ thống trạng thái cho tính năng Quên mật khẩu tuân thủ nghiêm ngặt mô hình phân tách 3 tầng của dự án kết hợp đồng bộ URL Search Parameters:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TẦNG QUẢN LÝ TRẠNG THÁI                         │
├─────────────────────┬──────────────────────┬───────────────────────────┤
│ 1. LOCAL STATE      │ 2. SERVER STATE      │ 3. GLOBAL STATE           │
│ (Hook Form/useState)│ (TanStack Query)     │ (Zustand Store)           │
├─────────────────────┼──────────────────────┼───────────────────────────┤
│ - email             │ - useForgotPassword  │ - KHÔNG SỬ DỤNG           │
│ - client validation │   Mutation           │   (Luồng guest unauth,    │
│ - isSubmittedFlag   │   (POST /auth/       │    không tạo hay thay đổi │
│                     │    forgot-password)  │    session đăng nhập)     │
│                     │ - isPending status   │                           │
│                     │ - generic feedback   │                           │
└─────────────────────┴──────────────────────┴───────────────────────────┘
```

### 2.1. State cục bộ (Local State - `useState` & `React Hook Form`)

Áp dụng cho dữ liệu biểu mẫu tức thì và phản hồi tương tác tại màn hình:

- **Form State (`React Hook Form` + Zod)**:
  - `email` (`string`): Địa chỉ email do người dùng nhập.
  - Quản lý trạng thái lifecycle của form: `isSubmitting`, `isValid`, `touchedFields`.
- **Client Validation Errors (`Zod`)**:
  - `email`: Bắt buộc nhập (`min(1, "Vui lòng nhập địa chỉ email")`), đúng định dạng email tiêu chuẩn RFC (`email("Định dạng email không hợp lệ")`).
  - Lỗi hiển thị ngay dưới ô input theo đúng quy ước UX tại `DESIGN.md`.
- **`feedbackState` (`{ type: "success" | "error"; message: string } | null`)**:
  - Quản lý qua `useState` trong container để hiển thị thông điệp phản hồi từ server trước khi chuyển hướng hoặc khi gặp lỗi rate-limit.

### 2.2. State máy chủ (Server State - `TanStack Query`)

Thao tác gửi yêu cầu khôi phục được quản lý bằng mutation hook qua axios instance tập trung (`@/lib/axios`), kết nối API Gateway:

- **`useForgotPasswordMutation()`**:
  - **Endpoint**: `POST /api/v1/auth/forgot-password` (qua API Gateway).
  - **Payload**: `{ email: string }`.
  - **Phản hồi từ server**:
    ```json
    {
      "success": true,
      "message": "Nếu email tồn tại trong hệ thống, mã xác thực OTP đã được gửi đến hòm thư của bạn."
    }
    ```
  - **Nguyên tắc bảo mật chống User Enumeration**:
    - Backend **luôn trả về HTTP 200** với thông điệp chung chung bất kể email có tồn tại trong cơ sở dữ liệu hay không. Frontend tuyệt đối không hiển thị thông báo "Email không tồn tại trên hệ thống" để tránh rò rỉ danh tính nhân viên.
  - **Trạng thái thực thi (`MutationState`)**:
    - `isPending`: Vô hiệu hóa (`disabled`) ô input email và kích hoạt spinner trên `SubmitButton` nhằm ngăn chặn gửi liên tục nhiều request (double-submit).
    - `isError`: Bắt lỗi HTTP 429 (Too Many Requests - vi phạm Rate Limit theo mục 3 `ARCHITECTURE.md`) hoặc lỗi hạ tầng 500/503. Hiển thị banner cảnh báo `accent-danger` với thông báo tương ứng.
    - `isSuccess`: Hiển thị banner thành công và kích hoạt điều hướng sang màn hình nhập OTP `/reset-password?email=...` sau khoảng trễ ngắn (hoặc trực tiếp qua callback).
  - **Không lưu dữ liệu phản hồi vào Zustand**: Server state chỉ tồn tại trong vòng đời mutation của TanStack Query.

### 2.3. State toàn cục (Global State - `Zustand`)

- **Quy tắc kiến trúc**: **Không sử dụng Zustand cho tính năng Quên mật khẩu**.
- **Lý do**:
  - Màn hình Quên mật khẩu thuộc luồng người dùng vãng lai (unauthenticated guest flow).
  - Tính năng không sinh ra phiên làm việc mới, không cấp phát JWT token, và không có dữ liệu trạng thái nào cần chia sẻ xuyên suốt toàn ứng dụng hay giữa các module nghiệp vụ nội bộ.
  - Tránh ô nhiễm store toàn cục bằng các trường dữ liệu tạm thời.

### 2.4. Trạng thái tham số URL (URL Search Parameters)

Quản lý trạng thái truyền tải dữ liệu giữa các màn hình xác thực thông qua URL:

- **Chiều nhận vào (`/forgot-password?email=...`)**:
  - Nếu người dùng chuyển từ trang Đăng nhập sang (hoặc từ đường dẫn ngoài), component trích xuất param `email` bằng `useSearchParams()` để điền sẵn vào ô input email (`defaultValues.email`), nâng cao trải nghiệm người dùng.
- **Chiều gửi đi (`/reset-password?email=...`)**:
  - Khi gửi yêu cầu thành công, điều hướng sang màn hình nhập OTP kế tiếp kèm email đã được mã hóa:
    `navigate(`/reset-password?email=${encodeURIComponent(submittedEmail)}`)`.
  - Giúp màn hình nhập OTP nhận diện ngay tài khoản cần xác thực mà không cần phụ thuộc vào global state hay in-memory storage dễ bị mất khi người dùng bấm refresh trình duyệt (F5).

---

## 3. Cấu trúc dữ liệu & TypeScript Interfaces

Tuân thủ nghiêm ngặt quy tắc tại `.agent/rules/frontend-standards.md`: **tuyệt đối không sử dụng kiểu `any`**, tất cả dữ liệu đều có kiểu định nghĩa rõ ràng (`interface` / `type`), các thuộc tính không thay đổi được đánh dấu `readonly`.

### 3.1. Schema & Kiểu dữ liệu xác thực (Zod Schema & API DTOs)

```typescript
import { z } from "zod";

/**
 * Zod validation schema cho form Quên mật khẩu
 */
export const forgotPasswordFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập địa chỉ email")
    .email("Định dạng email không hợp lệ"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordFormSchema>;

/**
 * DTO gửi lên API Gateway: POST /api/v1/auth/forgot-password
 */
export interface ForgotPasswordRequest {
  readonly email: string;
}

/**
 * DTO phản hồi trả về từ API Gateway
 */
export interface ForgotPasswordResponse {
  readonly success: boolean;
  readonly message: string;
}

/**
 * Trạng thái thông điệp phản hồi trên giao diện
 */
export interface FormFeedbackState {
  readonly type: "success" | "error" | "info";
  readonly message: string;
}
```

### 3.2. Cấu trúc Props cho các Dumb Components cốt lõi

```typescript
import type { ReactNode } from "react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";

/**
 * Props cho FormFeedbackBanner (Shared UI)
 * Hỗ trợ hiển thị phản hồi dạng alert banner theo token thiết kế
 */
export interface FormFeedbackBannerProps {
  readonly type: "success" | "error" | "info";
  readonly message: string | null;
  readonly onClose?: () => void;
  readonly className?: string;
}

/**
 * Props cho TextInput (Shared UI)
 * Bo góc: rounded-xs (4px), viền hairline #e6e6e6
 */
export interface ForgotPasswordTextInputProps {
  readonly id: string;
  readonly label: string;
  readonly type?: "email" | "text";
  readonly placeholder?: string;
  readonly error?: string;
  readonly disabled?: boolean;
  readonly registration: ReturnType<UseFormRegister<ForgotPasswordFormData>>;
}

/**
 * Props cho SubmitButton (Shared UI)
 * Nút hành động chính: màu primary #0075de, bo góc rounded-full
 */
export interface SubmitButtonProps {
  readonly children: ReactNode;
  readonly isLoading: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly type?: "button" | "submit" | "reset";
}

/**
 * Props cho BackToLoginLink (Presentational)
 * Liên kết quay lại trang Đăng nhập
 */
export interface BackToLoginLinkProps {
  readonly to?: string;
  readonly label?: string;
  readonly disabled?: boolean;
  readonly className?: string;
}

/**
 * Props cho ForgotPasswordForm (Dumb Presentational Form)
 * Nhận toàn bộ props điều khiển từ container, không tự gọi API hay quản lý side-effects
 */
export interface ForgotPasswordFormProps {
  readonly register: UseFormRegister<ForgotPasswordFormData>;
  readonly errors: FieldErrors<ForgotPasswordFormData>;
  readonly feedback: FormFeedbackState | null;
  readonly isSubmitting: boolean;
  readonly onSubmit: () => void;
}

/**
 * Props cho AuthHeader
 * Vùng tiêu đề và mô tả ngắn đầu form
 */
export interface AuthHeaderProps {
  readonly title: string;
  readonly subtitle: string;
  readonly className?: string;
}
```

---

## 4. Kế hoạch triển khai & Ràng buộc bảo mật (Security & UX Checklist)

1. **Tuân thủ Design Tokens (`DESIGN.md`)**:
   - Nền bao phủ: `canvas-soft` (`#f6f5f4`).
   - Khung thẻ chứa: `AuthCard` bo góc `rounded-lg` (12px), nền surface `#ffffff`, viền hairline `#e6e6e6`, padding `spacing-lg` (24px).
   - Ô nhập liệu: `TextInput` bo góc **`rounded-xs` (4px)**, viền hairline, focus đổi màu primary `#0075de`.
   - Nút hành động chính: `SubmitButton` bo góc **`rounded-full`**, màu primary `#0075de`, active `#005bab`, tích hợp icon spinner SVG xoay đều khi đang xử lý.
   - Banner phản hồi: thành công dùng màu `accent-green` (`#1aae39`), lỗi dùng `accent-danger` (`#dc2626`), bo góc `rounded-xs` (4px).

2. **Bảo mật thông tin (Anti-User Enumeration)**:
   - Thông điệp phản hồi luôn đồng nhất: *"Nếu email tồn tại trong hệ thống, mã xác thực OTP đã được gửi đến hòm thư của bạn."*
   - Tuyệt đối không để lộ trạng thái email có trong cơ sở dữ liệu hay không.

3. **Luồng chuyển đổi & Tích hợp URL Param**:
   - Đọc query param `email` khi mount để hỗ trợ người dùng chuyển từ trang khác sang không phải gõ lại.
   - Khi mutation thành công, đẩy `email` sang query param của trang `/reset-password?email=...` để bước xác thực OTP kế tiếp sử dụng trực tiếp.

4. **Kiểm thử tự động (Unit & Integration Testing)**:
   - **Validation Test**: Kiểm tra hiển thị thông báo lỗi khi để trống ô email hoặc nhập email không đúng cú pháp RFC.
   - **Loading State Test**: Đảm bảo nút submit hiển thị spinner và ô input bị vô hiệu hóa trong thời gian mutation đang chờ phản hồi (`isPending = true`).
   - **Generic Feedback Test**: Đảm bảo sau khi submit thành công, banner hiển thị câu thông báo trung tính theo đúng đặc tả.
   - **Navigation Test**: Kiểm tra hàm điều hướng được gọi với đúng route `/reset-password?email=...` và param được encode an toàn.
