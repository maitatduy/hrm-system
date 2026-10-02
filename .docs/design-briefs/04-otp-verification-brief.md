# Đặc tả thiết kế giao diện (Design Brief): Màn hình Nhập mã OTP (OTP Verification)

Tài liệu đặc tả kỹ thuật hình ảnh dành cho AI UI generator / Design engine. Tuân thủ tuyệt đối quy chuẩn tại `.docs/ideas/04-otp-verification-idea.md`, `.docs/frontend-plans/04-otp-verification-plan.md` và `.docs/DESIGN.md`.

---

## 1. Hệ thống lưới và bố cục (Grid & Layout System)

### 1.1. Cấu trúc khung gốc (Root Frame)
- **Viewport tổng thể**: `min-h-screen w-full flex items-center justify-center p-4 bg-[#f6f5f4]` (token `canvas-soft`).
- **Phân bổ không gian**:
  - Giao diện xác thực độc lập ngoài Master Layout (không có Sidebar hay Header nội bộ).
  - Vị trí card: Căn giữa tuyệt đối cả hai trục ngang và dọc (`flex items-center justify-center`).

### 1.2. Bố cục khối chính (Container Card Layout)
- **Khung chứa chính (`AuthCard`)**:
  - Chiều rộng: `w-full max-w-[420px]` (chuẩn `max-w-md`).
  - Hướng phân bổ: `flex flex-col gap-6` (token `spacing-lg`: 24px).
  - Lớp đệm trong (padding): `p-6 md:p-8` (24px đến 32px).
- **Phân cấp bên trong Card**:
  - Phần đầu (`AuthHeader`): Tiêu đề chính căn giữa (`flex flex-col items-center text-center gap-2`).
  - Đoạn thông tin che mờ (`MaskedEmailNotice`): Căn giữa ngay dưới tiêu đề, khoảng cách dưới `spacing-md` (16px).
  - Phần thân (`OtpVerificationForm`): Cột dọc chứa banner phản hồi, nhóm 6 ô vuông OTP, nút submit và khu vực đếm ngược gửi lại mã (`flex flex-col gap-5`), khoảng cách giữa các khối chuẩn `spacing-md` (16px).
  - Phần liên kết điều hướng (`BackToLoginLink`): Căn giữa dưới cùng của form (`flex justify-center items-center pt-1`).

### 1.3. Bảng quy đổi Spacing áp dụng
- `spacing-xs`: `4px` (`gap-1`, `p-1`) - Khoảng cách vi mô, đệm nhỏ.
- `spacing-sm`: `8px` (`gap-2`, `p-2`) - Khoảng cách giữa các ô vuông nhập OTP trên mobile (`gap-2`), khoảng cách giữa tiêu đề và đoạn thông tin email.
- `spacing-md`: `16px` (`gap-4`, `p-4`) - Khoảng cách giữa các ô OTP trên desktop (`gap-3` đến `gap-4`), khoảng cách giữa các khối chính trong form.
- `spacing-lg`: `24px` (`gap-6`, `p-6`) - Padding trong card, khoảng cách giữa AuthHeader và OtpVerificationForm.

---

## 2. Đặc tả chi tiết Dumb Component

> Chỉ liệt kê các component được gắn nhãn `[DUMB]` từ `.docs/frontend-plans/04-otp-verification-plan.md`. Bỏ qua toàn bộ component `[SMART]`.

### 2.1. `AuthLayout` [SHARED UI]
- **Box style**: Khung toàn màn hình `min-h-screen w-full flex items-center justify-center relative overflow-hidden`.
- **Nền**: `bg-[#f6f5f4]` (`canvas-soft`).

### 2.2. `CanvasBackground` [SHARED UI]
- **Box style**: Lớp nền phẳng phủ tràn viền `absolute inset-0 z-0 bg-[#f6f5f4]`.

### 2.3. `AuthCard` [SHARED UI]
- **Box style**: Khối card trắng `relative z-10 w-full max-w-[420px] bg-[#ffffff]` (`surface`), bo góc **`rounded-lg` (12px)**, viền hairline **`border border-[#e6e6e6]`**, đổ bóng nhẹ đa lớp mờ (`shadow-[0_4px_24px_rgba(0,0,0,0.04)]`).

### 2.4. `AuthHeader`
- **Box style**: Khối căn giữa `flex flex-col items-center text-center gap-1`.

### 2.5. `AuthTitle`
- **Box style**: Khối văn bản tiêu đề chính.
- **Typography**: Font **`heading-3`** (22px - 26px, đậm 700), màu `#000000` (`ink`), khoảng cách dòng `leading-tight`.
- **Nội dung hiển thị**: "Xác thực mã OTP"

### 2.6. `MaskedEmailNotice`
- **Box style**: Đoạn văn bản hướng dẫn và định danh hòm thư, căn giữa `text-center px-2`.
- **Typography**: Font **`body-sm`** (14px, thường 400), màu `#615d59` (`ink-muted`), khoảng cách dòng `leading-relaxed`.
- **Định dạng hiển thị**: "Mã xác thực 6 chữ số đã được gửi tới hòm thư **ho***n@hrmcorp.vn**" (phần email được bôi đậm nhẹ trọng số 500 màu `#000000` `ink`).

### 2.7. `OtpVerificationForm`
- **Box style**: Form nhập liệu `w-full flex flex-col gap-5`.

### 2.8. `FormFeedbackBanner` [SHARED UI]
- **Box style**: Khung banner thông báo dẹt `w-full p-3.5 flex items-start justify-between gap-2.5 rounded-xs border`. Bo góc **`rounded-xs` (4px)**.
- **Biến thể trạng thái**:
  - *Error (Mã sai hoặc hết hạn)*: Nền đỏ mờ `bg-[#dc2626]/10`, viền `border-[#dc2626]/30`, chữ màu `#dc2626` (`accent-danger`).
  - *Success (Gửi lại mã thành công)*: Nền xanh mờ `bg-[#1aae39]/10`, viền `border-[#1aae39]/30`, chữ màu `#1aae39` (`accent-green`).
- **Typography**: Font `body-sm` (13-14px, trọng số 500), khoảng cách dòng `leading-snug`.

### 2.9. `OtpInputGroup` [SHARED UI]
- **Box style**: Hàng ngang căn giữa chứa chính xác 6 ô vuông nhập số `w-full flex items-center justify-center gap-2 md:gap-3 py-2`.

### 2.10. `OtpSlotInput` [SHARED UI]
- **Box style**: Ô vuông đơn lẻ kích thước `w-11 h-12 md:w-12 md:h-14 bg-[#ffffff]` (`surface`), viền hairline `border border-[#e6e6e6]`, bo góc chuẩn **`rounded-xs` (4px)** theo `DESIGN.md`.
- **Typography**: Chữ số căn giữa tuyệt đối (`text-center`), font **`heading-3`** (20px - 22px, đậm 600), màu `#000000` (`ink`).
- **Trạng thái tương tác**:
  - *Bình thường*: Viền `#e6e6e6`, nền `#ffffff`.
  - *Focus*: Viền đổi sang `#0075de` (`primary`), vòng hào quang mờ `ring-1 ring-[#0075de]`, `outline-none`.
  - *Có giá trị*: Viền `#cccccc` hoặc `#0075de`, hiển thị chữ số rõ nét.
  - *Error*: Viền `#dc2626` (`accent-danger`), vòng hào quang `ring-1 ring-[#dc2626]`.
  - *Disabled*: Nền `bg-[#f6f5f4]` (`canvas-soft`), chữ mờ `#a39e98` (`ink-faint`), con trỏ `not-allowed`.

### 2.11. `SubmitButton` [SHARED UI]
- **Box style**: Nút xác nhận tràn chiều ngang `w-full h-11 md:h-12 px-5 flex items-center justify-center gap-2 bg-[#0075de]` (`primary`).
- **Bo góc**: Chuẩn **`rounded-full`** theo quy chuẩn nút chính tại `DESIGN.md`.
- **Typography**: Chữ trắng `#ffffff`, font `body-md` (15-16px, trọng số 600), căn giữa.
- **Trạng thái tương tác**:
  - *Hover*: Nền chuyển sang màu đậm hơn `#0060b8`.
  - *Active / Pressed*: Nền chuyển `#005bab` (`primary-active`), scale nhẹ `scale-[0.99]`.
  - *Loading / Pending*: Vô hiệu hóa tương tác, hiển thị icon spinner trắng `18x18px`, chữ đổi thành "Đang xác thực...".
  - *Disabled*: Nền `#e6e6e6` (`hairline`), màu chữ `#a39e98` (`ink-faint`), con trỏ `not-allowed`.

### 2.12. `OtpResendSection`
- **Box style**: Khối điều khiển trạng thái gửi lại mã, căn giữa `w-full flex items-center justify-center text-center pt-1`.

### 2.13. `OtpCountdownTimer`
- **Box style**: Khối văn bản hiển thị thời gian chờ.
- **Typography**: Font **`body-sm`** (14px, thường 400), màu `#615d59` (`ink-muted`).
- **Định dạng hiển thị**: "Gửi lại mã sau **00:48**" (thời gian dạng mm:ss).

### 2.14. `ResendOtpButton`
- **Box style**: Nút bấm văn bản trong suốt `inline-block p-1 cursor-pointer select-none`.
- **Typography**: Font **`body-sm`** (14px, đậm vừa 500), màu `#0075de` (`primary`).
- **Trạng thái**: *Hover* gạch chân nhẹ (`underline`), *Active* đổi sang `#005bab` (`primary-active`).
- **Nội dung hiển thị**: "Gửi lại mã xác thực"

### 2.15. `BackToLoginLink`
- **Box style**: Liên kết văn bản căn giữa `inline-block py-1 text-center cursor-pointer select-none`.
- **Typography**: Font **`body-sm`** (14px - 15px, trọng số 500), màu `#0075de` (`primary`).
- **Trạng thái**: *Hover* gạch chân nhẹ (`underline`), *Active* đổi sang `#005bab` (`primary-active`).
- **Nội dung hiển thị**: "Quay lại đăng nhập"

---

## 3. Ràng buộc màu sắc (Color Palette Mapping)

Dịch chuyển toàn bộ màu sắc sang đúng mã HEX chuẩn hóa từ `.docs/DESIGN.md`:

| Tên Token | Mã HEX | Vai trò quy chuẩn trong Màn hình Xác thực mã OTP |
| :--- | :--- | :--- |
| `primary` | `#0075de` | Nút xác thực chính (`SubmitButton`), viền focus của 6 ô OTP, nút "Gửi lại mã xác thực", link "Quay lại đăng nhập". |
| `primary-active` | `#005bab` | Trạng thái nhấn giữ (`active`) của nút xác thực và các liên kết hành động. |
| `canvas-soft` | `#f6f5f4` | Nền toàn trang bao phủ sau card (`CanvasBackground`), nền của ô OTP khi ở trạng thái disabled. |
| `surface` | `#ffffff` | Nền thẻ card trung tâm (`AuthCard`), nền của 6 ô vuông nhập số (`OtpSlotInput`). |
| `hairline` | `#e6e6e6` | Viền xung quanh card, viền của 6 ô OTP ở trạng thái bình thường. |
| `ink` | `#000000` | Tiêu đề chính (`AuthTitle`), chữ số nhập vào từng ô OTP, email che mờ bôi đậm. |
| `ink-secondary` | `#31302e` | Chữ phụ, viền hover nhẹ của ô OTP. |
| `ink-muted` | `#615d59` | Đoạn thông báo hướng dẫn (`MaskedEmailNotice`), đồng hồ đếm ngược (`OtpCountdownTimer`). |
| `ink-faint` | `#a39e98` | Màu chữ khi ô input hoặc nút bấm bị disabled. |
| `accent-green` | `#1aae39` | Màu chữ và viền banner khi gửi lại mã OTP mới thành công. |
| `accent-danger` | `#dc2626` | Chữ, viền banner và viền các ô OTP khi mã xác thực sai hoặc hết hiệu lực. |

---

## 4. Dữ liệu mẫu thực tế (HRM Mock Data)

Dữ liệu tiếng Việt thực tế dành cho render mô phỏng và kiểm thử giao diện:

```json
{
  "systemMeta": {
    "brandName": "HRM System",
    "portalTitle": "Xác thực mã OTP",
    "maskedEmail": "ho***n@hrmcorp.vn",
    "fullEmail": "hoang.tran@hrmcorp.vn"
  },
  "otpMockState": {
    "sampleOtp": "582914",
    "slotValues": ["5", "8", "2", "9", "1", "4"],
    "cooldownRemainingSeconds": 48,
    "cooldownFormatted": "00:48"
  },
  "labels": {
    "title": "Xác thực mã OTP",
    "notice": "Mã xác thực 6 chữ số đã được gửi tới hòm thư",
    "submit": "Xác nhận mã",
    "submitting": "Đang xác thực...",
    "resendCooldown": "Gửi lại mã sau 00:48",
    "resendAction": "Gửi lại mã xác thực",
    "backToLogin": "Quay lại đăng nhập"
  },
  "feedbackStates": {
    "errorInvalidOtp": "Mã xác thực không chính xác hoặc đã hết hiệu lực. Vui lòng kiểm tra lại.",
    "successResent": "Mã xác thực mới đã được gửi tới hòm thư của bạn."
  },
  "sampleContext": {
    "targetEmployee": "Trần Thị Mai Hoàng",
    "department": "Phòng Quản trị Nguồn nhân lực"
  }
}
```
