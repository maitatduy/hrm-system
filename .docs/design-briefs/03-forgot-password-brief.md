# Đặc tả thiết kế giao diện (Design Brief): Màn hình Quên mật khẩu (Forgot Password)

Tài liệu đặc tả kỹ thuật hình ảnh dành cho AI UI generator / Design engine. Tuân thủ tuyệt đối quy chuẩn tại `.docs/ideas/03-forgot-password-idea.md`, `.docs/frontend-plans/03-forgot-password-plan.md` và `.docs/DESIGN.md`.

---

## 1. Hệ thống lưới và bố cục (Grid & Layout System)

### 1.1. Cấu trúc khung gốc (Root Frame)
- **Viewport tổng thể**: `min-h-screen w-full flex items-center justify-center p-4 bg-[#f6f5f4]` (token `canvas-soft`).
- **Phân bổ không gian**:
  - Độc lập ngoài Master Layout (không hiển thị Sidebar hay Header nội bộ).
  - Vị trí card: Căn giữa tuyệt đối cả hai trục ngang và dọc (`flex items-center justify-center`).

### 1.2. Bố cục khối chính (Container Card Layout)
- **Khung chứa chính (`AuthCard`)**:
  - Chiều rộng: `w-full max-w-[420px]` (chuẩn `max-w-md`).
  - Hướng phân bổ: `flex flex-col gap-6` (token `spacing-lg`: 24px).
  - Lớp đệm trong (padding): `p-6 md:p-8` (24px đến 32px).
- **Phân cấp bên trong Card**:
  - Phần đầu (`AuthHeader`): Logo trên cùng, tiêu đề và mô tả xếp dọc căn giữa (`flex flex-col items-center text-center gap-2`).
  - Phần thân (`ForgotPasswordForm`): Cột chứa banner phản hồi, trường nhập liệu Email và nút gửi mã (`flex flex-col gap-4`), khoảng cách giữa các trường là `spacing-md` (16px).
  - Phần liên kết điều hướng (`BackToLoginLink`): Căn giữa dưới nút submit (`flex justify-center items-center pt-1`).
  - Phần chân (`AuthFooter`): Xếp dưới cùng, đường kẻ phân cách hairline, căn giữa (`flex flex-col items-center text-center pt-2`).

### 1.3. Bảng quy đổi Spacing áp dụng
- `spacing-xs`: `4px` (`gap-1`, `p-1`) - Khoảng cách nhãn với input, khoảng cách icon mũi tên với chữ "Quay lại đăng nhập".
- `spacing-sm`: `8px` (`gap-2`, `p-2`) - Khoảng cách giữa icon và chữ trong banner phản hồi, khoảng cách giữa logo và tiêu đề.
- `spacing-md`: `16px` (`gap-4`, `p-4`) - Khoảng cách giữa các trường trong form (Banner $\leftrightarrow$ Email Field $\leftrightarrow$ Submit Button $\leftrightarrow$ Back Link).
- `spacing-lg`: `24px` (`gap-6`, `p-6`) - Padding trong card, khoảng cách giữa `AuthHeader` và `ForgotPasswordForm`.

---

## 2. Đặc tả chi tiết Dumb Component

> Chỉ liệt kê các component được gắn nhãn `[DUMB]` từ `.docs/frontend-plans/03-forgot-password-plan.md`. Bỏ qua toàn bộ component `[SMART]`.

### 2.1. `AuthLayout` [SHARED UI]
- **Box style**: Khung toàn màn hình `min-h-screen w-full flex items-center justify-center relative overflow-hidden`.
- **Nền**: `bg-[#f6f5f4]` (`canvas-soft`).

### 2.2. `CanvasBackground` [SHARED UI]
- **Box style**: Lớp nền phủ tràn viền `absolute inset-0 z-0 bg-[#f6f5f4]`. Họa tiết lưới vi mô hoặc ánh sáng mờ nhẹ với độ trong suốt cực thấp (opacity < 3%) tạo chiều sâu thị giác phẳng tối giản.

### 2.3. `AuthCard` [SHARED UI]
- **Box style**: Khối card trắng `relative z-10 w-full max-w-[420px] bg-[#ffffff]` (`surface`), bo góc **`rounded-lg` (12px)**, viền hairline **`border border-[#e6e6e6]`**, đổ bóng đa lớp siêu nhẹ (`shadow-[0_4px_24px_rgba(0,0,0,0.04)]`).

### 2.4. `AuthHeader`
- **Box style**: Khối căn giữa `flex flex-col items-center text-center gap-2 mb-2`.

### 2.5. `AppLogo` [SHARED UI]
- **Box style**: Biểu tượng khối vuông bo tròn `w-12 h-12 flex items-center justify-center rounded-md bg-[#0075de]/10 mb-1`. Bo góc **`rounded-md` (8px)**.
- **Icon biểu tượng**: Biểu tượng nhận diện HRM cách điệu, màu `#0075de` (`primary`), kích thước `28x28px`.

### 2.6. `AuthTitle`
- **Box style**: Khối văn bản tiêu đề chính.
- **Typography**: Font **`heading-3`** (22px, đậm 700), màu `#000000` (`ink`), khoảng cách dòng `leading-tight`.
- **Nội dung hiển thị**: "Quên mật khẩu"

### 2.7. `AuthSubtitle`
- **Box style**: Khối văn bản phụ giải thích luồng thực hiện.
- **Typography**: Font **`body-sm`** (14px, trọng số 400), màu `#615d59` (`ink-muted`), khoảng cách dòng `leading-relaxed`.
- **Nội dung hiển thị**: "Nhập email liên kết với tài khoản của bạn để nhận mã xác thực OTP khôi phục mật khẩu."

### 2.8. `ForgotPasswordForm`
- **Box style**: Khung form nhập liệu `w-full flex flex-col gap-4`.

### 2.9. `FormFeedbackBanner` [SHARED UI]
- **Box style**: Khung banner thông báo dẹt `w-full p-3 flex items-start gap-2.5 rounded-xs border`. Bo góc **`rounded-xs` (4px)**.
- **Biến thể trạng thái**:
  - *Success (Thành công)*: Nền xanh mờ `bg-[#1aae39]/10`, viền `border-[#1aae39]/30`, chữ màu `#1aae39` (`accent-green`), kèm icon `CheckCircle` kích thước `18x18px`.
  - *Error (Lỗi rate-limit / sự cố)*: Nền đỏ mờ `bg-[#dc2626]/10`, viền `border-[#dc2626]/30`, chữ màu `#dc2626` (`accent-danger`), kèm icon `AlertCircle` kích thước `18x18px`.
- **Typography**: Font `body-sm` (13-14px, trọng số 500), khoảng cách dòng `leading-snug`.

### 2.10. `FormField` [SHARED UI]
- **Box style**: Cột dọc `flex flex-col gap-1.5 w-full`.
- **Label**: Font `body-sm` (14px, trọng số 500), màu `#000000` (`ink`).
- **Message lỗi validation**: Font `caption` (12px, trọng số 400), màu `#dc2626` (`accent-danger`), hiển thị ngay sát dưới ô input.

### 2.11. `TextInput` [SHARED UI]
- **Box style**: Ô nhập liệu `w-full h-10 px-3 bg-[#ffffff]` (`surface`), viền hairline `border border-[#e6e6e6]`, bo góc chuẩn **`rounded-xs` (4px)** theo `DESIGN.md`.
- **Typography**: Font `body-md` (15-16px, trọng số 400), màu chữ gõ `#000000` (`ink`), placeholder màu `#a39e98` (`ink-faint`).
- **Trạng thái tương tác**:
  - *Normal*: Viền `#e6e6e6`, nền `#ffffff`.
  - *Hover (khi chưa focus)*: Viền chuyển sang màu trung tính đậm hơn `border-[#cccccc]`.
  - *Focus*: Viền đổi sang `#0075de` (`primary`), vòng hào quang mờ `ring-1 ring-[#0075de]`, `outline-none`.
  - *Error*: Viền đổi sang `#dc2626` (`accent-danger`), vòng hào quang `ring-1 ring-[#dc2626]`.
  - *Disabled*: Nền `bg-[#f6f5f4]` (`canvas-soft`), màu chữ mờ `#a39e98` (`ink-faint`), con trỏ `cursor-not-allowed`.

### 2.12. `SubmitButton` [SHARED UI]
- **Box style**: Nút bấm chính trải rộng `w-full h-11 px-4 flex items-center justify-center gap-2 bg-[#0075de]` (`primary`).
- **Bo góc**: Chuẩn **`rounded-full`** theo quy chuẩn nút chính tại `DESIGN.md`.
- **Typography**: Chữ trắng `#ffffff`, font `body-md` (15-16px, trọng số 600), căn giữa.
- **Trạng thái tương tác**:
  - *Hover*: Nền chuyển sang sắc thái đậm hơn (hướng tới `#005bab`).
  - *Active / Pressed*: Nền chuyển `#005bab` (`primary-active`), scale nhẹ `scale-[0.99]`.
  - *Loading / Pending*: Vô hiệu hóa tương tác, hiển thị icon xoay vòng (Spinner `18x18px` màu trắng `#ffffff`), chữ đổi thành "Đang gửi mã...".
  - *Disabled*: Nền `#e6e6e6` (`hairline`), màu chữ `#a39e98` (`ink-faint`), con trỏ `cursor-not-allowed`.

### 2.13. `BackToLoginLink`
- **Box style**: Cụm liên kết ngang `inline-flex items-center justify-center gap-1.5 py-1 text-center cursor-pointer select-none group`.
- **Icon**: Mũi tên quay lại (`ArrowLeft` hoặc `ChevronLeft`), kích thước `16x16px`, màu `#0075de` (`primary`), dịch chuyển nhẹ sang trái khi group hover (`group-hover:-translate-x-0.5 transition-transform`).
- **Typography**: Font `body-sm` (14px, trọng số 500), màu `#0075de` (`primary`).
- **Trạng thái**:
  - *Hover*: Chữ gạch chân nhẹ (`underline`), icon dịch nhẹ.
  - *Active*: Màu chữ đổi sang `#005bab` (`primary-active`).

### 2.14. `AuthFooter`
- **Box style**: Vùng chân card `w-full pt-4 border-t border-[#e6e6e6] flex flex-col items-center gap-1.5`.
- **Typography**:
  - Dòng bản quyền: Font `caption` (12px, trọng số 400), màu `#a39e98` (`ink-faint`).
  - Dòng hỗ trợ kỹ thuật: Font `caption` (12px, trọng số 400), màu `#615d59` (`ink-muted`), email/hotline màu `#0075de`.

---

## 3. Ràng buộc màu sắc (Color Palette Mapping)

Dịch chuyển toàn bộ màu sắc sang đúng mã HEX chuẩn hóa từ `.docs/DESIGN.md`:

| Tên Token | Mã HEX | Vai trò quy chuẩn trong Màn hình Quên mật khẩu |
| :--- | :--- | :--- |
| `primary` | `#0075de` | Nút gửi mã chính (`SubmitButton`), viền focus của input email, liên kết "Quay lại đăng nhập", màu icon logo. |
| `primary-active` | `#005bab` | Trạng thái nhấn giữ (`active`) của nút gửi mã và link "Quay lại đăng nhập". |
| `canvas-soft` | `#f6f5f4` | Nền toàn trang bao phủ sau card (`CanvasBackground`), nền của ô input khi ở trạng thái disabled. |
| `surface` | `#ffffff` | Nền thẻ card trung tâm (`AuthCard`), nền ô nhập liệu (`TextInput`). |
| `hairline` | `#e6e6e6` | Viền xung quanh card, viền input trạng thái bình thường, đường kẻ phân cách footer. |
| `ink` | `#000000` | Tiêu đề chính (`AuthTitle`), nhãn của trường nhập liệu (Label), chữ nội dung người dùng gõ vào input. |
| `ink-secondary` | `#31302e` | Chữ phụ, trạng thái viền hover nhẹ của input control. |
| `ink-muted` | `#615d59` | Đoạn mô tả phụ (`AuthSubtitle`), thông tin hotline hỗ trợ kỹ thuật ở chân card. |
| `ink-faint` | `#a39e98` | Chữ gợi ý mờ (placeholder input), dòng thông tin bản quyền và phiên bản hệ thống. |
| `accent-green` | `#1aae39` | Màu chữ, viền và icon trong `FormFeedbackBanner` khi gửi mã thành công (trạng thái an tâm). |
| `accent-danger` | `#dc2626` | Chữ và viền trong `FormFeedbackBanner` khi gặp lỗi rate-limit, viền input và thông báo lỗi validation trường. |

---

## 4. Dữ liệu mẫu thực tế (HRM Mock Data)

Dữ liệu tiếng Việt thực tế dành cho render mô phỏng và kiểm thử giao diện:

```json
{
  "systemMeta": {
    "brandName": "HRM System",
    "portalTitle": "Quên mật khẩu",
    "portalSubtitle": "Nhập email liên kết với tài khoản của bạn để nhận mã xác thực OTP khôi phục mật khẩu.",
    "version": "v1.2.0-rc3",
    "supportContact": "hotro@hrmcorp.vn - Hotline: 1900 6868",
    "copyright": "© 2026 HRM System Enterprise. All rights reserved."
  },
  "defaultPrefill": {
    "email": "hoang.tran@hrmcorp.vn"
  },
  "placeholders": {
    "email": "ten.nhanvien@hrmcorp.vn"
  },
  "labels": {
    "email": "Email công việc",
    "submit": "Gửi mã xác thực",
    "submitting": "Đang gửi mã...",
    "backToLogin": "Quay lại đăng nhập"
  },
  "feedbackStates": {
    "successGeneric": "Nếu email tồn tại trong hệ thống, mã xác thực OTP đã được gửi đến hòm thư của bạn. Vui lòng kiểm tra hộp thư đến (kể cả hòm thư rác/spam).",
    "rateLimitError": "Bạn đã gửi yêu cầu quá nhiều lần. Vui lòng chờ 5 phút trước khi thử lại để đảm bảo an toàn.",
    "fieldValidation": {
      "emailRequired": "Vui lòng nhập địa chỉ email",
      "emailInvalid": "Định dạng email công việc không hợp lệ (ví dụ: ten@congty.vn)"
    }
  },
  "sampleContext": {
    "targetEmployee": "Trần Thị Mai Hoàng",
    "department": "Phòng Quản trị Nguồn nhân lực",
    "position": "Chuyên viên Đãi ngộ & Tiền lương"
  }
}
```
