# Đặc tả thiết kế giao diện (Design Brief): Đổi mật khẩu & Đặt lại mật khẩu (Change / Reset Password)

Tài liệu đặc tả kỹ thuật hình ảnh dành cho AI UI generator / Design engine. Tuân thủ tuyệt đối quy chuẩn tại `.docs/ideas/05-change-password-idea.md`, `.docs/frontend-plans/05-change-password-plan.md` và `.docs/DESIGN.md`.

Đặc tả bao quát form dùng chung (`PasswordChangeForm`) cho cả hai ngữ cảnh hiển thị:
- **Ngữ cảnh 1 (Reset Password)**: Đặt lại mật khẩu sau OTP, nằm trong `AuthCard` căn giữa màn hình.
- **Ngữ cảnh 2 (Change Password)**: Tự đổi mật khẩu trong Cài đặt tài khoản, nằm trong `SettingsCard` thuộc Master Layout.

---

## 1. Hệ thống lưới và bố cục (Grid & Layout System)

### 1.1. Cấu trúc khung gốc (Root Frame) theo từng ngữ cảnh

#### Ngữ cảnh 1: Đặt lại mật khẩu (`/reset-password`)
- **Viewport tổng thể**: `min-h-screen w-full flex items-center justify-center p-4 bg-[#f6f5f4]` (token `canvas-soft`).
- **Phân bổ không gian**: Khung thẻ xác thực độc lập, căn giữa hai trục ngang và dọc, không có sidebar hay top header.
- **Khung chứa chính (`AuthCard`)**:
  - Chiều rộng: `w-full max-w-[440px]` (chuẩn `max-w-md`).
  - Hướng phân bổ: `flex flex-col gap-6` (token `spacing-lg`: 24px).
  - Lớp đệm trong (padding): `p-6 md:p-8` (24px đến 32px).

#### Ngữ cảnh 2: Đổi mật khẩu trong Cài đặt (`Account Settings`)
- **Viewport tổng thể**: Nằm trong khu vực nội dung chính của Master Layout (`main.flex-1 p-6 md:p-8 bg-[#f6f5f4]`).
- **Khung chứa chính (`SettingsCard`)**:
  - Chiều rộng: `w-full max-w-2xl` (tối đa 672px), đặt trong vùng làm việc của trang cài đặt.
  - Hướng phân bổ: `flex flex-col gap-6` (token `spacing-lg`: 24px).
  - Lớp đệm trong (padding): `p-6 md:p-8` (24px đến 32px).

### 1.2. Bố cục khối chính trong Form (`PasswordChangeForm`)
- **Hướng xếp chồng**: `flex flex-col gap-4` (token `spacing-md`: 16px).
- **Phân cấp bên trong**:
  - `FormFeedbackBanner`: Đặt trên cùng nếu có thông báo lỗi hoặc thành công từ server.
  - Trường mật khẩu hiện tại (`currentPassword`): Chỉ xuất hiện ở Ngữ cảnh 2, gồm Label, `PasswordInput` và dòng báo lỗi (nếu có).
  - Trường mật khẩu mới (`newPassword`): Gồm Label, `PasswordInput` và dòng báo lỗi.
  - Khối danh sách tiêu chuẩn độ mạnh (`PasswordStrengthIndicator`): Đặt ngay dưới ô mật khẩu mới, khoảng cách `gap-1.5` đến `gap-2` (`spacing-xs` đến `spacing-sm`).
  - Trường xác nhận mật khẩu (`confirmPassword`): Gồm Label, `PasswordInput` và dòng báo lỗi.
  - Khu vực nút hành động (`FormActionsGroup`):
    - Ngữ cảnh 1: Một nút `SubmitButton` duy nhất, chiều rộng `w-full`.
    - Ngữ cảnh 2: Hàng ngang `flex items-center justify-end gap-3 pt-2`, gồm nút Hủy (`SecondaryButton`) và nút Lưu (`SubmitButton`).

### 1.3. Bảng quy đổi Spacing áp dụng
- `spacing-xs`: `4px` (`gap-1`, `p-1`) - Đệm trong icon, khoảng cách giữa icon trạng thái và chữ tiêu chuẩn.
- `spacing-sm`: `8px` (`gap-2`, `p-2`) - Khoảng cách giữa các tiêu chuẩn kiểm tra mật khẩu, khoảng cách giữa label và input (`gap-1.5`).
- `spacing-md`: `16px` (`gap-4`, `p-4`) - Khoảng cách giữa các trường nhập liệu (`FormField`) trong form.
- `spacing-lg`: `24px` (`gap-6`, `p-6`) - Đệm trong của `AuthCard` và `SettingsCard`, khoảng cách giữa header và thân card.

---

## 2. Đặc tả chi tiết Dumb Component

> Chỉ liệt kê các component được gắn nhãn `[DUMB]` từ `.docs/frontend-plans/05-change-password-plan.md`. Bỏ qua toàn bộ component `[SMART]`.

### 2.1. `AuthLayout` [SHARED UI]
- **Box style**: Khung bao quanh toàn màn hình `min-h-screen w-full flex items-center justify-center relative overflow-hidden`.
- **Nền**: `bg-[#f6f5f4]` (`canvas-soft`).

### 2.2. `CanvasBackground` [SHARED UI]
- **Box style**: Lớp nền phẳng phủ tràn viền `absolute inset-0 z-0 bg-[#f6f5f4]`.

### 2.3. `AuthCard` [SHARED UI]
- **Box style**: Khối card trắng trung tâm `relative z-10 w-full max-w-[440px] bg-[#ffffff]` (`surface`), bo góc **`rounded-lg` (12px)**, viền hairline **`border border-[#e6e6e6]`**, đổ bóng nhẹ nhiều tầng `shadow-[0_4px_24px_rgba(0,0,0,0.04)]`.

### 2.4. `AuthHeader`
- **Box style**: Khối phần đầu `flex flex-col items-center text-center gap-1.5`.

### 2.5. `AppLogo` [SHARED UI]
- **Box style**: Khối logo thương hiệu HRM `flex items-center justify-center gap-2 mb-2 select-none`.
- **Typography**: Chữ "HRM System", font `heading-3` (20px, đậm 700), màu `#000000` (`ink`).

### 2.6. `AuthTitle`
- **Box style**: Khối văn bản tiêu đề chính.
- **Typography**: Font **`heading-3`** (22px - 24px, đậm 700), màu `#000000` (`ink`), khoảng cách dòng `leading-tight`.
- **Nội dung hiển thị (Ngữ cảnh 1)**: "Đặt lại mật khẩu"

### 2.7. `AuthSubtitle`
- **Box style**: Đoạn văn bản hướng dẫn phụ căn giữa.
- **Typography**: Font **`body-sm`** (14px, thường 400), màu `#615d59` (`ink-muted`), khoảng cách dòng `leading-relaxed`.
- **Nội dung hiển thị (Ngữ cảnh 1)**: "Vui lòng thiết lập mật khẩu mới có độ an toàn cao để bảo vệ tài khoản của bạn."

### 2.8. `SettingsCard` [SHARED UI]
- **Box style**: Thẻ cài đặt cấu hình trong Master Layout `w-full max-w-2xl bg-[#ffffff]` (`surface`), bo góc **`rounded-lg` (12px)**, viền hairline **`border border-[#e6e6e6]`**, đổ bóng nhẹ `shadow-xs`.

### 2.9. `SettingsCardHeader`
- **Box style**: Khu vực tiêu đề phần cài đặt `flex flex-col gap-1 pb-4 border-b border-[#e6e6e6]`.

### 2.10. `SettingsTitle`
- **Box style**: Tiêu đề khối cài đặt.
- **Typography**: Font **`heading-3`** (20px - 22px, đậm 700), màu `#000000` (`ink`).
- **Nội dung hiển thị (Ngữ cảnh 2)**: "Đổi mật khẩu tài khoản"

### 2.11. `SettingsDescription`
- **Box style**: Mô tả ngắn giải thích mục đích của section.
- **Typography**: Font **`body-sm`** (14px, thường 400), màu `#615d59` (`ink-muted`).
- **Nội dung hiển thị (Ngữ cảnh 2)**: "Cập nhật mật khẩu định kỳ giúp tăng cường an toàn dữ liệu nhân sự và thông tin cá nhân."

### 2.12. `PasswordChangeForm` [SHARED UI]
- **Box style**: Khung form nhập liệu `w-full flex flex-col gap-4`.

### 2.13. `FormField` [SHARED UI]
- **Box style**: Khối bao bọc một trường nhập liệu `w-full flex flex-col gap-1.5`.
- **Label**: Font `body-sm` (14px, trọng số 500), màu `#000000` (`ink`).
- **Dòng thông báo lỗi**: Font `caption` (12-13px, trọng số 400), màu `#dc2626` (`accent-danger`), xuất hiện ngay dưới input khi có lỗi validation.

### 2.14. `PasswordInput` [SHARED UI]
- **Box style**: Hộp nhập liệu mật khẩu `relative w-full flex items-center h-11 bg-[#ffffff]` (`surface`), bo góc chuẩn **`rounded-xs` (4px)**, viền hairline **`border border-[#e6e6e6]`**, đệm trong `pl-3.5 pr-11`.
- **Typography**: Font `body-md` (15px, thường 400), màu `#000000` (`ink`), placeholder màu `#a39e98` (`ink-faint`).
- **Nút bật/tắt hiển thị (Eye Toggle)**: Icon `Eye` / `EyeOff` kích thước `20x20px`, màu `#615d59` (`ink-muted`), vị trí `absolute right-3 top-1/2 -translate-y-1/2`, hover đổi màu sang `#000000` (`ink`).
- **Trạng thái tương tác**:
  - *Hover*: Viền `#cccccc`.
  - *Focus*: Viền đổi sang `#0075de` (`primary`), vòng hào quang nhẹ `ring-1 ring-[#0075de]`, `outline-none`.
  - *Error*: Viền `#dc2626` (`accent-danger`), vòng hào quang `ring-1 ring-[#dc2626]`.
  - *Disabled*: Nền `#f6f5f4` (`canvas-soft`), chữ `#a39e98` (`ink-faint`), con trỏ `not-allowed`.

### 2.15. `PasswordStrengthIndicator` [SHARED UI]
- **Box style**: Khối danh sách các tiêu chuẩn kiểm tra độ an toàn `w-full bg-[#f6f5f4]/60 p-3 rounded-xs border border-[#e6e6e6]/60 flex flex-col gap-2 mt-1`.
- **Tiêu đề khối**: Dòng chữ "Yêu cầu mật khẩu an toàn:", font `caption` (12px, trọng số 600), màu `#31302e` (`ink-secondary`).

### 2.16. `PasswordRequirementItem` [SHARED UI]
- **Box style**: Một dòng tiêu chí kiểm tra `flex items-center gap-2 text-left select-none transition-colors duration-150`.
- **Biến thể trạng thái**:
  - *Khi ĐÃ ĐẠT (`isMet: true`)*:
    - Icon: `Check` tròn hoặc tích chữ V `14x14px`, nét vẽ stroke 2.5px, màu `#1aae39` (`accent-green`).
    - Typography: Font **`caption`** (12-13px, trọng số 500), màu **`#1aae39`** (`accent-green`).
  - *Khi CHƯA ĐẠT (`isMet: false`)*:
    - Icon: `Circle` tròn chấm rỗng `14x14px`, stroke 1.5px, màu `#a39e98` (`ink-faint`) hoặc `#615d59` (`ink-muted`).
    - Typography: Font **`caption`** (12-13px, trọng số 400), màu **`#615d59`** (`ink-muted`).

### 2.17. `FormFeedbackBanner` [SHARED UI]
- **Box style**: Khung banner thông báo dẹt `w-full p-3.5 flex items-start justify-between gap-2.5 rounded-xs border`. Bo góc **`rounded-xs` (4px)**.
- **Biến thể trạng thái**:
  - *Error*: Nền đỏ nhạt `bg-[#dc2626]/10`, viền `border-[#dc2626]/30`, chữ màu `#dc2626` (`accent-danger`).
  - *Success*: Nền xanh nhạt `bg-[#1aae39]/10`, viền `border-[#1aae39]/30`, chữ màu `#1aae39` (`accent-green`).
- **Typography**: Font `body-sm` (13-14px, trọng số 500), khoảng cách dòng `leading-snug`.

### 2.18. `SubmitButton` [SHARED UI]
- **Box style**: Nút hành động chính lưu mật khẩu `h-11 px-6 flex items-center justify-center gap-2 bg-[#0075de]` (`primary`).
- **Bo góc**: Chuẩn **`rounded-full`** theo quy chuẩn nút chính tại `DESIGN.md`.
- **Typography**: Chữ trắng `#ffffff`, font `body-md` (15-16px, trọng số 600), căn giữa.
- **Trạng thái tương tác**:
  - *Hover*: Nền chuyển sang `#0060b8`.
  - *Active / Pressed*: Nền chuyển `#005bab` (`primary-active`), scale nhẹ `scale-[0.99]`.
  - *Loading / Pending*: Vô hiệu hóa tương tác, hiển thị icon spinner trắng `18x18px`, nhãn đổi thành "Đang lưu mật khẩu...".
  - *Disabled (khi form chưa đủ điều kiện)*: Nền `#e6e6e6` (`hairline`), màu chữ `#a39e98` (`ink-faint`), con trỏ `not-allowed`, vô hiệu hóa sự kiện click.

### 2.19. `SecondaryButton` [SHARED UI]
- **Box style**: Nút hành động phụ (Hủy / Đặt lại ở Ngữ cảnh 2) `h-11 px-5 flex items-center justify-center bg-[#ffffff]` (`surface`), viền hairline **`border border-[#e6e6e6]`**, bo góc **`rounded-md` (8px)**.
- **Typography**: Font **`body-sm`** (14px, trọng số 500), màu `#000000` (`ink`).
- **Trạng thái tương tác**:
  - *Hover*: Nền chuyển sang `#f6f5f4` (`canvas-soft`).
  - *Active*: Nền `#e6e6e6` (`hairline`).
  - *Disabled*: Độ mờ `opacity-50`, con trỏ `not-allowed`.

### 2.20. `FormActionsGroup`
- **Box style**:
  - Ngữ cảnh 1: `w-full pt-1`.
  - Ngữ cảnh 2: Hàng ngang `w-full flex items-center justify-end gap-3 pt-3 border-t border-[#e6e6e6]`.

### 2.21. `BackToLoginLink`
- **Box style**: Liên kết văn bản căn giữa (chỉ xuất hiện ở Ngữ cảnh 1) `inline-block py-1 text-center cursor-pointer select-none`.
- **Typography**: Font **`body-sm`** (14px, trọng số 500), màu `#0075de` (`primary`).
- **Trạng thái**: *Hover* gạch chân nhẹ (`underline`), *Active* đổi sang `#005bab` (`primary-active`).
- **Nội dung hiển thị**: "Quay lại trang đăng nhập"

---

## 3. Ràng buộc màu sắc (Color Palette Mapping)

Dịch chuyển toàn bộ màu sắc sang đúng mã HEX chuẩn hóa từ `.docs/DESIGN.md`:

| Tên Token | Mã HEX | Vai trò quy chuẩn trong Màn hình Đổi / Đặt lại mật khẩu |
| :--- | :--- | :--- |
| `primary` | `#0075de` | Nút lưu mật khẩu chính (`SubmitButton`), viền focus của các ô `PasswordInput`, liên kết "Quay lại trang đăng nhập". |
| `primary-active` | `#005bab` | Trạng thái nhấn giữ (`active`) của nút lưu chính và link điều hướng. |
| `canvas-soft` | `#f6f5f4` | Nền toàn trang bao phủ sau card (`CanvasBackground`), nền khối `PasswordStrengthIndicator`, nền ô input khi disabled. |
| `surface` | `#ffffff` | Nền thẻ card trung tâm (`AuthCard`), nền thẻ cài đặt (`SettingsCard`), nền ô nhập mật khẩu (`PasswordInput`), nền nút Hủy (`SecondaryButton`). |
| `hairline` | `#e6e6e6` | Viền xung quanh `AuthCard` và `SettingsCard`, viền ô `PasswordInput` trạng thái thường, đường phân cách footer, nền nút submit khi bị disable. |
| `ink` | `#000000` | Tiêu đề chính (`AuthTitle`, `SettingsTitle`), nhãn các trường (`FormField` label), chữ nhập vào ô mật khẩu, chữ nút Hủy. |
| `ink-secondary` | `#31302e` | Tiêu đề khối yêu cầu mật khẩu ("Yêu cầu mật khẩu an toàn:"). |
| `ink-muted` | `#615d59` | Đoạn hướng dẫn phụ (`AuthSubtitle`, `SettingsDescription`), icon con mắt ở trạng thái nghỉ, chữ và icon các tiêu chí chưa đạt. |
| `ink-faint` | `#a39e98` | Chữ placeholder ("Nhập mật khẩu mới..."), chữ trên nút submit khi bị disabled. |
| `accent-green` | `#1aae39` | Màu chữ và icon dấu tích `Check` cho các tiêu chí độ mạnh đã đạt, viền và chữ banner khi đổi mật khẩu thành công. |
| `accent-danger` | `#dc2626` | Dòng báo lỗi validation (mật khẩu không khớp, sai mật khẩu cũ), viền input khi có lỗi, viền và chữ banner lỗi từ API. |

---

## 4. Dữ liệu mẫu thực tế (HRM Mock Data)

Dữ liệu tiếng Việt thực tế dành cho render mô phỏng cả hai ngữ cảnh nghiệp vụ:

```json
{
  "systemMeta": {
    "brandName": "HRM System",
    "securityPolicy": "Yêu cầu mật khẩu tối thiểu 8 ký tự, có chữ hoa, chữ thường, chữ số và ký tự đặc biệt."
  },
  "contextResetPassword": {
    "targetUser": {
      "fullName": "Phan Quốc Bảo",
      "email": "bao.phan@hrmcorp.vn",
      "employeeCode": "EMP-2023-0145"
    },
    "tokens": {
      "resetToken": "sample-jwt-reset-token-xyz-123456"
    },
    "formLabels": {
      "cardTitle": "Đặt lại mật khẩu",
      "cardSubtitle": "Vui lòng thiết lập mật khẩu mới có độ an toàn cao để bảo vệ tài khoản của bạn.",
      "newPasswordLabel": "Mật khẩu mới",
      "newPasswordPlaceholder": "Nhập mật khẩu mới của bạn",
      "confirmPasswordLabel": "Xác nhận mật khẩu mới",
      "confirmPasswordPlaceholder": "Nhập lại mật khẩu mới",
      "submitButton": "Lưu mật khẩu mới",
      "submittingButton": "Đang cập nhật mật khẩu...",
      "backLink": "Quay lại trang đăng nhập"
    }
  },
  "contextChangePasswordSettings": {
    "targetUser": {
      "fullName": "Trần Thị Mai Hoàng",
      "email": "hoang.tran@hrmcorp.vn",
      "employeeCode": "EMP-2024-0089",
      "department": "Ban Quản trị Nguồn nhân lực",
      "position": "Chuyên viên Quản trị Nhân sự"
    },
    "formLabels": {
      "cardTitle": "Đổi mật khẩu tài khoản",
      "cardSubtitle": "Cập nhật mật khẩu định kỳ giúp tăng cường an toàn dữ liệu nhân sự và thông tin cá nhân.",
      "currentPasswordLabel": "Mật khẩu hiện tại",
      "currentPasswordPlaceholder": "Nhập mật khẩu bạn đang sử dụng",
      "newPasswordLabel": "Mật khẩu mới",
      "newPasswordPlaceholder": "Nhập mật khẩu mới cần thay đổi",
      "confirmPasswordLabel": "Xác nhận mật khẩu mới",
      "confirmPasswordPlaceholder": "Nhập lại mật khẩu mới",
      "cancelButton": "Hủy bỏ",
      "submitButton": "Cập nhật mật khẩu",
      "submittingButton": "Đang lưu thay đổi..."
    }
  },
  "passwordStrengthCriteria": [
    {
      "id": "min-length",
      "label": "Tối thiểu 8 ký tự",
      "sampleStateValid": true,
      "sampleStateInvalid": false
    },
    {
      "id": "has-uppercase",
      "label": "Chứa ít nhất 1 chữ cái in hoa (A-Z)",
      "sampleStateValid": true,
      "sampleStateInvalid": false
    },
    {
      "id": "has-lowercase",
      "label": "Chứa ít nhất 1 chữ cái in thường (a-z)",
      "sampleStateValid": true,
      "sampleStateInvalid": false
    },
    {
      "id": "has-number",
      "label": "Chứa ít nhất 1 chữ số (0-9)",
      "sampleStateValid": true,
      "sampleStateInvalid": false
    },
    {
      "id": "has-special",
      "label": "Chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*)",
      "sampleStateValid": true,
      "sampleStateInvalid": false
    }
  ],
  "mockFeedbackScenarios": {
    "successChange": {
      "type": "success",
      "message": "Đổi mật khẩu thành công. Thông tin bảo mật của bạn đã được cập nhật."
    },
    "successReset": {
      "type": "success",
      "message": "Đặt lại mật khẩu thành công. Đang chuyển hướng về trang đăng nhập..."
    },
    "errorWrongCurrent": {
      "type": "error",
      "message": "Mật khẩu hiện tại không chính xác. Vui lòng kiểm tra lại."
    },
    "errorExpiredToken": {
      "type": "error",
      "message": "Phiên đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. Vui lòng gửi lại yêu cầu OTP."
    },
    "errorMismatchedPassword": {
      "field": "confirmPassword",
      "message": "Mật khẩu xác nhận không trùng khớp với mật khẩu mới."
    }
  }
}
```
