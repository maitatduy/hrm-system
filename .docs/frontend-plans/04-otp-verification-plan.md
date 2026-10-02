# Bản quy hoạch kỹ thuật Frontend: Màn hình Nhập mã OTP (OTP Verification)

Tài liệu quy hoạch kỹ thuật cho màn hình Xác thực mã OTP (`OtpVerificationPage`) của hệ thống HRM System, tích hợp các yêu cầu từ `.docs/ideas/04-otp-verification-idea.md`, các quy chuẩn thiết kế tại `.docs/DESIGN.md`, kiến trúc hệ thống tại `.docs/ARCHITECTURE.md` và tiêu chuẩn lập trình tại `.agent/rules/frontend-standards.md`.

---

## 1. Phân rã component

### 1.1. Sơ đồ cây phân cấp component (Component Hierarchy)

```
OtpVerificationPage [SMART]
└── AuthLayout [DUMB] [SHARED UI]
    ├── CanvasBackground [DUMB] [SHARED UI]
    └── AuthCard [DUMB] [SHARED UI]
        ├── AuthHeader [DUMB]
        │   └── AuthTitle [DUMB]
        ├── MaskedEmailNotice [DUMB]
        ├── OtpVerificationFormContainer [SMART]
        │   └── OtpVerificationForm [DUMB]
        │       ├── FormFeedbackBanner [DUMB] [SHARED UI]
        │       ├── OtpInputGroup [DUMB] [SHARED UI]
        │       │   ├── OtpSlotInput [DUMB] [SHARED UI] (Slot 0)
        │       │   ├── OtpSlotInput [DUMB] [SHARED UI] (Slot 1)
        │       │   ├── OtpSlotInput [DUMB] [SHARED UI] (Slot 2)
        │       │   ├── OtpSlotInput [DUMB] [SHARED UI] (Slot 3)
        │       │   ├── OtpSlotInput [DUMB] [SHARED UI] (Slot 4)
        │       │   └── OtpSlotInput [DUMB] [SHARED UI] (Slot 5)
        │       ├── SubmitButton [DUMB] [SHARED UI]
        │       └── OtpResendSection [DUMB]
        │           ├── OtpCountdownTimer [DUMB]
        │           └── ResendOtpButton [DUMB]
        └── BackToLoginLink [DUMB]
```

### 1.2. Danh sách và phân loại chi tiết component

| Component                      | Phân loại | Khả năng tái sử dụng (Shared UI) | Trách nhiệm kỹ thuật & Ràng buộc Design Token |
| :----------------------------- | :-------- | :------------------------------- | :-------------------------------------------- |
| `OtpVerificationPage`          | `[SMART]` | Không (Page Root)                | Component trang gốc độc lập ngoài Master Layout. Đọc query param `email` từ URL, kiểm tra tính hợp lệ (nếu thiếu email sẽ điều hướng quay lại `/forgot-password`), điều phối sau khi xác thực thành công sang màn hình Đặt lại mật khẩu (`/reset-password`). |
| `AuthLayout`                   | `[DUMB]`  | Có (`[SHARED UI]`)               | Khung bọc giao diện xác thực toàn màn hình (`min-h-screen flex items-center justify-center`), dùng chung cho toàn bộ luồng Auth. |
| `CanvasBackground`             | `[DUMB]`  | Có (`[SHARED UI]`)               | Lớp nền bao phủ toàn trang, sử dụng token màu `canvas-soft` (`#f6f5f4`). |
| `AuthCard`                     | `[DUMB]`  | Có (`[SHARED UI]`)               | Khối card trung tâm, nền surface `#ffffff`, viền hairline `#e6e6e6`, bo góc `rounded-lg` (12px), đệm trong `spacing-lg` (24px - 32px), độ rộng tối đa chuẩn `max-w-md w-full`. |
| `AuthHeader`                   | `[DUMB]`  | Không                            | Vùng đầu card căn giữa, chứa tiêu đề chính của trang. |
| `AuthTitle`                    | `[DUMB]`  | Không                            | Tiêu đề card "Xác thực mã OTP", font `heading-3` (22px - 26px, đậm 700), màu chữ `ink` (`#000000`). |
| `MaskedEmailNotice`            | `[DUMB]`  | Không                            | Đoạn thông báo hiển thị email đã che mờ (ví dụ: `ho***n@hrmcorp.vn`), font `body-sm` (14px, 400), màu `ink-muted` (`#615d59`), căn giữa giúp người dùng nhận diện hộp thư mà không làm lộ thông tin nhạy cảm. |
| `OtpVerificationFormContainer`  | `[SMART]` | Không                            | Container quản lý logic nghiệp vụ: khởi tạo form Zod, quản lý chuỗi 6 ký tự OTP, quản lý bộ đếm ngược 60 giây (`cooldown`), gọi mutation xác thực (`useVerifyOtpMutation`) và mutation gửi lại mã (`useResendOtpMutation`). |
| `OtpVerificationForm`           | `[DUMB]`  | Không                            | Form thuần UI, nhận các props điều khiển từ container để hiển thị khối 6 ô OTP, nút xác nhận, và khu vực gửi lại mã. |
| `FormFeedbackBanner`           | `[DUMB]`  | Có (`[SHARED UI]`)               | Banner thông báo trạng thái (`success`, `error`), bo góc `rounded-xs` (4px), viền và chữ theo chuẩn semantic tokens (`#1aae39` hoặc `#dc2626`). |
| `OtpInputGroup`                | `[DUMB]`  | Có (`[SHARED UI]`)               | Nhóm 6 ô nhập mã số, bố trí theo hàng ngang (`flex justify-center gap-2 md:gap-3`), hỗ trợ cơ chế auto-advance (tự nhảy ô khi gõ), backspace lùi ô, và bắt sự kiện paste chuỗi 6 số. |
| `OtpSlotInput`                 | `[DUMB]`  | Có (`[SHARED UI]`)               | Từng ô vuông nhập số riêng biệt: kích thước `w-11 h-12 md:w-12 md:h-14`, căn giữa chữ số, font `heading-3` (20px - 22px, đậm 600), nền surface `#ffffff`, viền hairline `#e6e6e6`, bo góc **`rounded-xs` (4px)**. Khi focus: viền chuyển sang primary `#0075de` kèm vòng ring mờ. |
| `SubmitButton`                 | `[DUMB]`  | Có (`[SHARED UI]`)               | Nút submit chính full chiều rộng card (`w-full`), màu nền primary `#0075de` (active/pressed `#005bab`), chữ trắng bold, bo góc **`rounded-full`**. Hiển thị spinner khi mutation đang chạy. |
| `OtpResendSection`             | `[DUMB]`  | Không                            | Khu vực điều khiển gửi lại mã, căn giữa dưới nút submit, chuyển đổi hiển thị giữa đồng hồ đếm ngược và nút bấm gửi lại. |
| `OtpCountdownTimer`            | `[DUMB]`  | Không                            | Hiển thị dòng chữ đếm ngược: "Gửi lại mã sau 00:XX", font `body-sm` (14px, 400), màu chữ `ink-muted` (`#615d59`). |
| `ResendOtpButton`              | `[DUMB]`  | Không                            | Nút bấm văn bản "Gửi lại mã xác thực", font `body-sm` (14px, 500), màu primary `#0075de`, hover gạch chân nhẹ, kích hoạt khi bộ đếm cooldown chạm 0. |
| `BackToLoginLink`              | `[DUMB]`  | Không                            | Text link điều hướng quay về `/login` hoặc `/forgot-password`, màu primary `#0075de`, hover gạch chân, căn giữa. |

---

## 2. Quản lý trạng thái (State Management)

Hệ thống trạng thái cho tính năng Nhập mã OTP tuân thủ mô hình phân tách 3 tầng của dự án kết hợp đồng bộ tham số URL:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TẦNG QUẢN LÝ TRẠNG THÁI                         │
├─────────────────────┬──────────────────────┬───────────────────────────┤
│ 1. LOCAL STATE      │ 2. SERVER STATE      │ 3. GLOBAL STATE           │
│ (Hook Form/useState)│ (TanStack Query)     │ (Zustand Store)           │
├─────────────────────┼──────────────────────┼───────────────────────────┤
│ - otp (string[])    │ - useVerifyOtp       │ - KHÔNG SỬ DỤNG           │
│ - activeSlotIndex   │   Mutation           │   (Luồng guest unauth,    │
│ - cooldown (60s)    │   (POST /auth/       │    không lưu session user │
│ - feedback state    │    verify-otp)       │    hay token vào store)   │
│                     │ - useResendOtp       │                           │
│                     │   Mutation           │                           │
└─────────────────────┴──────────────────────┴───────────────────────────┘
```

### 2.1. State cục bộ (Local State - `useState` & `React Hook Form`)

- **`otpDigits` (`string[]` - mảng 6 phần tử)**:
  - Quản lý giá trị nhập liệu từng ô: `["", "", "", "", "", ""]`.
  - Giá trị tổng hợp `otp = otpDigits.join("")` được gắn kết với React Hook Form để validate bằng Zod schema.
- **`activeSlotIndex` (`number` - 0 đến 5)**:
  - Chỉ mục của ô vuông OTP đang được focus. Hỗ trợ thao tác:
    - Khi người dùng gõ 1 số $\rightarrow$ tự động chuyển focus sang `index + 1`.
    - Khi bấm phím `Backspace` $\rightarrow$ xóa ký tự hiện tại hoặc lùi focus về `index - 1`.
    - Khi paste chuỗi 6 ký tự số $\rightarrow$ tự động điền đầy đủ 6 ô và focus vào ô cuối cùng.
- **`cooldownSeconds` (`number`)**:
  - Quản lý bộ đếm thời gian cho phép gửi lại mã OTP (mặc định khởi tạo `60` giây).
  - Tự động đếm lùi từng giây thông qua `useEffect` và `setInterval`. Khi `cooldownSeconds === 0`, chuyển trạng thái cho phép người dùng click "Gửi lại mã xác thực".
- **`feedback` (`{ type: "success" | "error"; message: string } | null`)**:
  - Quản lý thông báo lỗi (ví dụ: "Mã OTP không chính xác hoặc đã hết hạn") hoặc thông báo thành công khi gửi lại mã mới.

### 2.2. State máy chủ (Server State - `TanStack Query`)

Các tương tác mạng đều đi qua API Gateway bằng axios client tập trung:

- **`useVerifyOtpMutation()`**:
  - **Endpoint**: `POST /api/v1/auth/verify-otp`.
  - **Payload**: `{ email: string, otp: string }`.
  - **Phản hồi từ server**:
    ```json
    {
      "success": true,
      "message": "Xác thực mã OTP thành công.",
      "resetToken": "eyJhGciOiJIUzI1NiIsInR5cCI6..."
    }
    ```
  - **Trạng thái thực thi**:
    - `isPending`: Vô hiệu hóa toàn bộ 6 ô OTP và nút bấm, kích hoạt hiệu ứng loading spinner.
    - `onError`: Bắt lỗi HTTP 400/401 (mã OTP sai hoặc hết hạn), hiển thị banner `accent-danger` ("Mã OTP không chính xác hoặc đã hết hiệu lực. Vui lòng kiểm tra lại hoặc yêu cầu gửi mã mới.").
    - `onSuccess`: Điều hướng sang màn hình đặt lại mật khẩu mới: `/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(data.resetToken)}`.
- **`useResendOtpMutation()`**:
  - **Endpoint**: `POST /api/v1/auth/resend-otp` (hoặc `POST /api/v1/auth/forgot-password`).
  - **Payload**: `{ email: string }`.
  - **Khi thành công**: Reset `cooldownSeconds = 60`, làm trống 6 ô OTP, focus lại ô đầu tiên, và hiển thị banner thông báo "Mã xác thực mới đã được gửi tới email của bạn.".
  - **Không lưu dữ liệu vào Zustand**.

### 2.3. State toàn cục (Global State - `Zustand`)

- **Quy tắc**: **Tuyệt đối không sử dụng Zustand cho tính năng này**.
- **Lý do**: Đây là luồng người dùng vãng lai chưa hoàn tất xác thực (unauthenticated guest flow). Dữ liệu `resetToken` chỉ có giá trị chuyển tiếp duy nhất sang màn hình `/reset-password` và không đại diện cho phiên đăng nhập (`accessToken` hay `sessionUser`).

### 2.4. Trạng thái tham số URL (URL Search Parameters)

- **`email` (`string | null`)**:
  - Lấy từ URL: `/verify-otp?email=ten%40congty.vn`.
  - **Ràng buộc an toàn**: Nếu URL không chứa query param `email` hợp lệ (người dùng truy cập thẳng link không qua bước nhập email), container sẽ tự động redirect về trang `/forgot-password`.
  - Khi xác thực thành công, tham số `email` tiếp tục được truyền sang URL của màn hình kế tiếp `/reset-password?email=...&token=...`.

---

## 3. Cấu trúc dữ liệu & TypeScript Interfaces

Tuân thủ nghiêm ngặt chuẩn `frontend-standards.md`: **tuyệt đối cấm sử dụng kiểu `any`**, toàn bộ trường bất biến được đánh dấu `readonly`.

### 3.1. Schema & Kiểu dữ liệu xác thực (Zod Schema & API DTOs)

```typescript
import { z } from "zod";

/**
 * Zod validation schema cho mã OTP 6 số
 */
export const otpVerificationSchema = z.object({
  otp: z
    .string()
    .length(6, "Vui lòng nhập đủ 6 chữ số mã xác thực")
    .regex(/^\d{6}$/, "Mã xác thực chỉ bao gồm các chữ số (0-9)"),
});

export type OtpVerificationFormData = z.infer<typeof otpVerificationSchema>;

/**
 * DTO gửi lên API Gateway: POST /api/v1/auth/verify-otp
 */
export interface VerifyOtpRequest {
  readonly email: string;
  readonly otp: string;
}

/**
 * DTO phản hồi trả về khi xác thực OTP thành công
 */
export interface VerifyOtpResponse {
  readonly success: boolean;
  readonly message: string;
  readonly resetToken: string;
}

/**
 * DTO gửi yêu cầu gửi lại mã OTP: POST /api/v1/auth/resend-otp
 */
export interface ResendOtpRequest {
  readonly email: string;
}

/**
 * DTO phản hồi gửi lại mã OTP
 */
export interface ResendOtpResponse {
  readonly success: boolean;
  readonly message: string;
}

/**
 * Trạng thái thông điệp phản hồi
 */
export interface OtpFeedbackState {
  readonly type: "success" | "error" | "info";
  readonly message: string;
}
```

### 3.2. Cấu trúc Props cho các Dumb Components cốt lõi

```typescript
import type { ReactNode } from "react";

/**
 * Props cho MaskedEmailNotice
 * Nhận email đầy đủ và tự động che mờ hiển thị dạng an toàn
 */
export interface MaskedEmailNoticeProps {
  readonly email: string;
  readonly className?: string;
}

/**
 * Props cho OtpSlotInput (Từng ô vuông nhập số)
 * Bo góc: rounded-xs (4px), viền hairline #e6e6e6, focus primary #0075de
 */
export interface OtpSlotInputProps {
  readonly index: number;
  readonly value: string;
  readonly disabled?: boolean;
  readonly isError?: boolean;
  readonly isFocused?: boolean;
  readonly onChange: (index: number, char: string) => void;
  readonly onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  readonly onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  readonly onFocus: (index: number) => void;
}

/**
 * Props cho OtpInputGroup (Cụm 6 ô vuông OTP)
 */
export interface OtpInputGroupProps {
  readonly value: string[];
  readonly disabled?: boolean;
  readonly isError?: boolean;
  readonly activeIndex: number;
  readonly onChange: (index: number, char: string) => void;
  readonly onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  readonly onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  readonly onFocus: (index: number) => void;
  readonly className?: string;
}

/**
 * Props cho khu vực hiển thị đếm ngược và nút gửi lại mã
 */
export interface OtpResendSectionProps {
  readonly cooldown: number;
  readonly isResending: boolean;
  readonly onResend: () => void;
  readonly className?: string;
}

/**
 * Props cho OtpVerificationForm (Dumb Presentational Form)
 */
export interface OtpVerificationFormProps {
  readonly otpDigits: string[];
  readonly activeSlotIndex: number;
  readonly feedback: OtpFeedbackState | null;
  readonly isSubmitting: boolean;
  readonly isResending: boolean;
  readonly cooldown: number;
  readonly onOtpChange: (index: number, char: string) => void;
  readonly onOtpKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  readonly onOtpPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  readonly onOtpFocus: (index: number) => void;
  readonly onSubmit: () => void;
  readonly onResend: () => void;
  readonly onClearFeedback?: () => void;
}

/**
 * Props cho nút bấm SubmitButton
 */
export interface SubmitButtonProps {
  readonly children: ReactNode;
  readonly isLoading: boolean;
  readonly loadingText?: string;
  readonly disabled?: boolean;
  readonly className?: string;
}
```

---

## 4. Kế hoạch triển khai & Ràng buộc bảo mật (Security & UX Checklist)

1. **Tuân thủ Design Tokens (`DESIGN.md`)**:
   - Nền toàn trang: `canvas-soft` (`#f6f5f4`).
   - Khung thẻ chứa: `AuthCard` bo góc `rounded-lg` (12px), nền `surface` (`#ffffff`), viền hairline `#e6e6e6`, padding trong `spacing-lg` (24px - 32px).
   - 6 ô vuông OTP: Kích thước chuẩn `w-11 h-12 md:w-12 md:h-14`, bo góc **`rounded-xs` (4px)**, viền hairline, khi focus chuyển sang màu `primary` (`#0075de`).
   - Nút xác nhận: `SubmitButton` bo góc **`rounded-full`**, màu `primary` (`#0075de`), hover/active `#005bab`.
   - Banner thông báo: Bo góc `rounded-xs` (4px), trạng thái thành công màu `accent-green` (`#1aae39`), lỗi màu `accent-danger` (`#dc2626`).

2. **Thuật toán Che mờ Email (Email Masking)**:
   - Áp dụng hàm tiện ích: `nguyenvana@company.com` $\rightarrow$ `ng***a@company.com`.
   - Đảm bảo người dùng nhận biết đúng đích hòm thư nhưng không để lộ toàn bộ danh tính trên màn hình công cộng.

3. **Tương tác bàn phím (Keyboard UX & Auto-advance)**:
   - Nhập ký tự: Chỉ chấp nhận ký tự số `0-9`. Khi nhập thành công 1 số, con trỏ tự động chuyển sang ô kế tiếp.
   - Xóa lùi (Backspace): Nếu ô hiện tại rỗng, tự động lùi về ô trước đó và xóa ký tự.
   - Dán dữ liệu (Clipboard Paste): Khi người dùng dán chuỗi (ví dụ: `123456`), hệ thống trích xuất 6 chữ số đầu tiên, điền lần lượt vào 6 ô và tự động chuyển focus về ô cuối cùng.

4. **Kiểm thử tự động (Unit & Integration Testing)**:
   - **Auto-advance Test**: Kiểm tra nhập liên tục 6 số tự động nhảy ô và kích hoạt submit.
   - **Paste Test**: Kiểm tra dán chuỗi hợp lệ `654321` điền đúng 6 ô.
   - **Cooldown Timer Test**: Kiểm tra đồng hồ đếm ngược từ 60 về 0, chuyển đổi giữa label đếm ngược và nút bấm gửi lại.
   - **Security Redirection Test**: Kiểm tra trường hợp truy cập thiếu param `email` sẽ bị redirect về trang `/forgot-password`.
