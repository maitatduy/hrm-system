# Đặc tả thiết kế giao diện (Design Brief): Màn hình Đăng nhập (Login)

Tài liệu đặc tả kỹ thuật hình ảnh dành cho AI UI generator / Design engine. Tuân thủ tuyệt đối quy chuẩn tại `.docs/ideas/01-login-idea.md`, `.docs/frontend-plans/01-login-plan.md` và `.docs/DESIGN.md`.

---

## 1. Hệ thống lưới và bố cục (Grid & Layout System)

### 1.1. Cấu trúc khung gốc (Root Frame)
- **Viewport tổng thể**: `min-h-screen w-full flex items-center justify-center p-4 bg-[#f6f5f4]` (token `canvas-soft`).
- **Phân bổ không gian**:
  - Không sử dụng Master Layout (không có Sidebar và Header điều hướng).
  - Vị trí card đăng nhập: Căn giữa tuyệt đối cả hai chiều ngang và dọc (`flex items-center justify-center`).

### 1.2. Bố cục khối chính (Container Card Layout)
- **Khung chứa chính (`AuthCard`)**:
  - Chiều rộng: `w-full max-w-[420px]` (tương đương `max-w-md`).
  - Hướng xếp chồng: `flex flex-col gap-6` (token `spacing-lg`: 24px).
  - Lớp đệm trong: `p-6 md:p-8` (24px đến 32px).
- **Phân cấp bên trong Card**:
  - Phần đầu (`AuthHeader`): Logo trên cùng, tiêu đề và mô tả xếp dọc căn giữa (`flex flex-col items-center text-center gap-2`).
  - Phần thân (`LoginForm`): Cột các trường nhập liệu (`flex flex-col gap-4`), khoảng cách giữa các trường là `spacing-md` (16px).
  - Phần tùy chọn (`LoginOptionsRow`): Hàng ngang căn đều 2 mép (`flex justify-between items-center`).
  - Phần chân (`AuthFooter`): Xếp dưới cùng, căn giữa (`flex flex-col items-center text-center pt-2`).

### 1.3. Bảng quy đổi Spacing áp dụng
- `spacing-xs`: `4px` (`gap-1`, `p-1`) - Giãn cách icon mắt trong password, khoảng cách nhãn với input.
- `spacing-sm`: `8px` (`gap-2`, `p-2`) - Khoảng cách giữa checkbox và label, khoảng cách giữa logo và tiêu đề.
- `spacing-md`: `16px` (`gap-4`, `p-4`) - Khoảng cách giữa các trường trong form (Email field $\leftrightarrow$ Password field $\leftrightarrow$ Submit button).
- `spacing-lg`: `24px` (`gap-6`, `p-6`) - Padding trong card, khoảng cách giữa AuthHeader và LoginForm.

---

## 2. Đặc tả chi tiết Dumb Component

> Chỉ quy định các component được gắn nhãn `[DUMB]` từ `.docs/frontend-plans/01-login-plan.md`. Bỏ qua toàn bộ component `[SMART]`.

### 2.1. `AuthLayout` [SHARED UI]
- **Box style**: Khung toàn màn hình `min-h-screen w-full flex items-center justify-center relative overflow-hidden`.
- **Nền**: `bg-[#f6f5f4]` (`canvas-soft`).

### 2.2. `CanvasBackground` [SHARED UI]
- **Box style**: Lớp nền phủ tràn viền `absolute inset-0 z-0 bg-[#f6f5f4]`. Có thể thêm họa tiết lưới chấm hoặc sóng ánh sáng cực mờ (opacity < 3%) để tăng chiều sâu nhưng không gây phân tâm.

### 2.3. `AuthCard` [SHARED UI]
- **Box style**: Khối card trắng `relative z-10 w-full max-w-[420px] bg-[#ffffff]` (`surface`), bo góc **`rounded-lg` (12px)**, viền hairline **`border border-[#e6e6e6]`**, đổ bóng nhẹ nhiều lớp mờ (`shadow-[0_4px_24px_rgba(0,0,0,0.04)]`).

### 2.4. `AuthHeader`
- **Box style**: Khối căn giữa `flex flex-col items-center text-center gap-2 mb-2`.

### 2.5. `AppLogo` [SHARED UI]
- **Box style**: Biểu tượng khối vuông bo tròn `w-12 h-12 flex items-center justify-center rounded-md bg-[#0075de]/10 mb-1`.
- **Icon biểu tượng**: Logo nhận diện HRM cách điệu, màu `#0075de` (`primary`), kích thước `28x28px`.

### 2.6. `AuthTitle`
- **Box style**: Khối văn bản tiêu đề.
- **Typography**: Font **`heading-3`** (22px, đậm 700), màu `#000000` (`ink`), khoảng cách dòng `leading-tight`.
- **Nội dung hiển thị**: "Đăng nhập hệ thống"

### 2.7. `AuthSubtitle`
- **Box style**: Khối văn bản phụ.
- **Typography**: Font **`body-sm`** (14px, trọng số 400), màu `#615d59` (`ink-muted`).
- **Nội dung hiển thị**: "Nhập thông tin xác thực để truy cập không gian làm việc"

### 2.8. `LoginForm`
- **Box style**: Form nhập liệu `w-full flex flex-col gap-4`.

### 2.9. `FormErrorMessageBanner` [SHARED UI]
- **Box style**: Khung thông báo lỗi dẹt `w-full p-3 flex items-start gap-2.5 bg-[#dc2626]/5 border border-[#dc2626]/20 rounded-xs`. Bo góc **`rounded-xs` (4px)**.
- **Icon**: AlertCircle / Exclamation icon `16x16px`, màu `#dc2626` (`accent-danger`).
- **Typography**: Font `body-sm` (13-14px, trọng số 500), màu `#dc2626` (`accent-danger`).
- **Nguyên tắc bảo mật**: Không phân định rõ sai email hay sai mật khẩu.

### 2.10. `FormField` [SHARED UI]
- **Box style**: Cột dọc `flex flex-col gap-1.5 w-full`.
- **Label**: Font `body-sm` (14px, trọng số 500), màu `#000000` (`ink`).
- **Message lỗi validation trường**: Font `caption` (12px, trọng số 400), màu `#dc2626` (`accent-danger`).

### 2.11. `TextInput` [SHARED UI]
- **Box style**: Khung nhập text `w-full h-10 px-3 bg-[#ffffff]` (`surface`), viền hairline `border border-[#e6e6e6]`, bo góc chuẩn **`rounded-xs` (4px)** theo đúng DESIGN.md.
- **Typography**: Font `body-md` (15-16px, trọng số 400), màu chữ nhập `#000000` (`ink`), placeholder màu `#a39e98` (`ink-faint`).
- **Trạng thái tương tác**:
  - *Focus*: Viền đổi sang `#0075de` (`primary`), vòng hào quang mờ `ring-1 ring-[#0075de]`, `outline-none`.
  - *Hover (khi chưa focus)*: Viền chuyển sang `#31302e` mờ nhẹ (`border-[#cccccc]`).
  - *Error*: Viền chuyển sang `#dc2626` (`accent-danger`).
  - *Disabled*: Nền `#f6f5f4`, chữ mờ `#a39e98`, con trỏ `not-allowed`.

### 2.12. `PasswordInput` [SHARED UI]
- **Box style**: Khung chứa tương đối `relative w-full flex items-center`.
- **Input control**: Kích thước `w-full h-10 pl-3 pr-10 bg-[#ffffff] border border-[#e6e6e6] rounded-xs`. Bo góc chuẩn **`rounded-xs` (4px)**.
- **Nút Toggle Eye Icon**: Nút bấm phụ góc phải `absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#615d59] hover:text-[#000000] focus:outline-none`. Icon `18x18px` (`Eye` / `EyeOff`).
- **Typography & Trạng thái**: Tương tự `TextInput`.

### 2.13. `LoginOptionsRow`
- **Box style**: Hàng ngang `w-full flex items-center justify-between pt-1 pb-1`.

### 2.14. `RememberMeCheckbox` [SHARED UI]
- **Box style**: Cụm tương tác `flex items-center gap-2 cursor-pointer select-none`.
- **Checkbox control**: Vuông nhỏ `16x16px`, bo góc **`rounded-xs` (4px)**, viền `border border-[#e6e6e6] bg-[#ffffff]`.
- **Trạng thái Checked**: Nền `#0075de` (`primary`), viền `#0075de`, dấu check màu trắng `#ffffff`.
- **Label**: Font `body-sm` (14px, trọng số 400), màu `#31302e` (`ink-secondary`).

### 2.15. `ForgotPasswordLink`
- **Box style**: Thẻ liên kết `text-right cursor-pointer`.
- **Typography**: Font `body-sm` (14px, trọng số 500), màu `#0075de` (`primary`).
- **Trạng thái**: *Hover* gạch chân nhẹ (`underline`), *Active* màu `#005bab` (`primary-active`).

### 2.16. `SubmitButton` [SHARED UI]
- **Box style**: Nút bấm tràn chiều ngang `w-full h-11 px-4 flex items-center justify-center gap-2 bg-[#0075de]` (`primary`).
- **Bo góc**: Chuẩn **`rounded-full`** theo quy tắc nút chính tại DESIGN.md.
- **Typography**: Chữ trắng `#ffffff`, font `body-md` (15-16px, trọng số 600), căn giữa.
- **Trạng thái**:
  - *Hover*: Nền chuyển sang màu đậm hơn (đạt sắc thái chuyển tiếp tới `#005bab`).
  - *Active / Pressed*: Nền chuyển `#005bab` (`primary-active`), scale nhẹ `scale-[0.99]`.
  - *Loading / Pending*: Vô hiệu hóa tương tác, hiển thị icon xoay vòng (Spinner 18x18px, màu trắng `#ffffff`), chữ chuyển thành "Đang đăng nhập...".
  - *Disabled*: Nền `#e6e6e6`, chữ `#a39e98`, con trỏ `not-allowed`.

### 2.17. `AuthFooter`
- **Box style**: Vùng chân card `w-full pt-4 border-t border-[#e6e6e6] flex flex-col items-center gap-1.5`.
- **Typography**:
  - Dòng bản quyền: Font `caption` (12px, trọng số 400), màu `#a39e98` (`ink-faint`).
  - Dòng hỗ trợ: Font `caption` (12px, trọng số 400), màu `#615d59` (`ink-muted`), link hỗ trợ màu `#0075de`.

---

## 3. Ràng buộc màu sắc (Color Palette Mapping)

Chỉ sử dụng tập hợp các mã hex đã định nghĩa trong `.docs/DESIGN.md`. Tuyệt đối không thêm màu lạ:

| Tên Token | Mã HEX | Vai trò quy chuẩn trong Màn hình Đăng nhập |
| :--- | :--- | :--- |
| `primary` | `#0075de` | Nút Đăng nhập chính (`SubmitButton`), viền focus của input, link Quên mật khẩu, checkbox khi checked, màu logo. |
| `primary-active` | `#005bab` | Trạng thái nhấn giữ (`active`) của nút Đăng nhập và link Quên mật khẩu. |
| `canvas-soft` | `#f6f5f4` | Nền toàn trang bao phủ phía sau card đăng nhập (`CanvasBackground`), nền input khi disabled. |
| `surface` | `#ffffff` | Nền thẻ card đăng nhập (`AuthCard`), nền ô nhập liệu (`TextInput`, `PasswordInput`), nền checkbox. |
| `hairline` | `#e6e6e6` | Viền xung quanh card, viền của input ở trạng thái bình thường, đường kẻ phân cách footer. |
| `ink` | `#000000` | Tiêu đề đăng nhập (`AuthTitle`), nhãn của trường nhập liệu (Label), chữ người dùng nhập vào input. |
| `ink-secondary` | `#31302e` | Nhãn checkbox "Ghi nhớ đăng nhập", icon phụ khi hover. |
| `ink-muted` | `#615d59` | Mô tả phụ bên dưới tiêu đề (`AuthSubtitle`), icon con mắt ẩn/hiện mật khẩu, thông tin hotline hỗ trợ. |
| `ink-faint` | `#a39e98` | Chữ gợi ý mờ (placeholder input), chữ bản quyền phiên bản hệ thống dưới chân card. |
| `accent-danger` | `#dc2626` | Chữ và icon trong banner thông báo lỗi sai email/mật khẩu, viền input khi validate thất bại, thông báo lỗi trường. |

---

## 4. Dữ liệu mẫu thực tế (HRM Mock Data)

Dữ liệu tiếng Việt thực tế dành cho render và kiểm thử giao diện đăng nhập:

```json
{
  "systemMeta": {
    "brandName": "HRM System",
    "portalTitle": "Đăng nhập hệ thống",
    "portalSubtitle": "Nhập thông tin xác thực để truy cập không gian làm việc",
    "version": "v1.2.0-rc3",
    "supportContact": "hotro@hrmcorp.vn - Hotline: 1900 6868",
    "copyright": "© 2026 HRM System Enterprise. All rights reserved."
  },
  "defaultPrefill": {
    "email": "an.nguyen@hrmcorp.vn",
    "password": "Password@2026",
    "rememberMe": true
  },
  "placeholders": {
    "email": "ten.nhanvien@hrmcorp.vn",
    "password": "Nhập mật khẩu của bạn"
  },
  "labels": {
    "email": "Email công việc",
    "password": "Mật khẩu",
    "rememberMe": "Ghi nhớ đăng nhập",
    "forgotPassword": "Quên mật khẩu?",
    "submit": "Đăng nhập",
    "submitting": "Đang xác thực..."
  },
  "errorStates": {
    "authFailedGeneric": "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.",
    "accountLocked": "Tài khoản tạm thời bị khóa do nhập sai nhiều lần. Vui lòng thử lại sau 15 phút hoặc liên hệ Quản trị viên.",
    "fieldValidation": {
      "emailRequired": "Vui lòng nhập địa chỉ email",
      "emailInvalid": "Định dạng email công việc không hợp lệ (ví dụ: ten@congty.vn)",
      "passwordRequired": "Vui lòng nhập mật khẩu"
    }
  }
}
```
