# Design brief: màn hình đăng nhập

Nguồn: `.docs/ideas/01-login-idea.md`, `.docs/frontend-plans/01-login-plan.md`. Token màu và bo góc lấy từ `frontend/src/index.css`. Phần 2 của file này là đặc tả gốc cho các component dùng chung của nhóm màn xác thực (03, 04, 05 tham chiếu lại).

Nguyên tắc chung: tối giản, ít chữ nhất có thể, không logo, không icon trang trí, không placeholder, không dấu sao bắt buộc.

## 1. Lưới và bố cục

- Trang: `min-h-screen w-full flex flex-col bg-canvas-soft`, nội dung căn giữa hai chiều, `p-4`.
- Card: `w-full max-w-[480px] flex flex-col gap-6 p-7 md:p-9`.
- Thứ tự trong card: tiêu đề, banner (nếu có), form.
- Form: `flex flex-col gap-5`. Hàng tùy chọn: `flex items-center justify-between py-1`.

## 2. Đặc tả component

### AuthLayout [SHARED UI]
- Nền `canvas-soft`, lớp `CanvasBackground` phủ toàn trang: lưới chấm tròn 1px cách nhau 32px, độ mờ 3%.

### AuthCard [SHARED UI]
- Nền `surface`, viền 1px `hairline`, `rounded-lg`, đổ bóng `0 4px 24px rgba(0,0,0,0.04)`.

### AuthHeader
- Tiêu đề `h1` 26px (28px từ md), đậm 700, màu `ink`, căn giữa, `leading-tight`.
- Mô tả tùy chọn: 16px, màu `ink-muted`, căn giữa. Màn đăng nhập không dùng.

### FormField [SHARED UI]
- Nhãn 15px, đậm 500, màu `ink`. Lỗi dưới ô 13px, màu `accent-danger`.

### TextInput, PasswordInput [SHARED UI]
- `h-11`, đệm ngang 14px, chữ 15px `ink`, nền `surface`, viền `hairline`, `rounded-xs`.
- Hover: viền `hairline-strong`. Focus: viền và `ring-1` màu `primary`.
- Lỗi: viền và ring `accent-danger`. Disabled: nền `canvas-soft`, chữ `ink-faint`.
- PasswordInput có nút mắt ẩn/hiện 20px màu `ink-muted` ở mép phải, hover `ink`.

### Checkbox [SHARED UI]
- Ô 18px, `rounded-xs`, màu khi chọn `primary`. Nhãn 15px `ink-secondary`.

### AuthLink
- 15px, đậm 500, màu `primary`, hover gạch chân, active `primary-active`. Disabled: `ink-faint`.

### Button primary [SHARED UI]
- `h-12 w-full rounded-full`, chữ trắng 16px đậm 600, nền `primary`.
- Hover `primary-hover`, active `primary-active` và thu nhỏ 1%.
- Disabled: nền `hairline`, chữ `ink-faint`.
- Đang xử lý: ẩn chữ, chỉ hiện vòng quay 18px ở giữa, giữ nguyên kích thước nút.

### FormFeedbackBanner [SHARED UI]
- `px-3.5 py-2.5 rounded-xs`, không viền, không icon, chữ 14px đậm 500.
- Thành công: nền `accent-green` 10%, chữ `accent-green`. Lỗi: nền `accent-danger` 10%, chữ `accent-danger`.
- Có nút X 14px khi đóng được.

## 3. Màu sắc

| Token | Hex | Dùng cho |
| :-- | :-- | :-- |
| `primary` | `#0075de` | nút đăng nhập, link, focus, checkbox |
| `primary-hover` | `#0060b8` | hover nút |
| `primary-active` | `#005bab` | nhấn nút, nhấn link |
| `canvas-soft` | `#f6f5f4` | nền trang, ô disabled |
| `surface` | `#ffffff` | card, ô nhập |
| `hairline` | `#e6e6e6` | viền card, viền ô, nút disabled |
| `hairline-strong` | `#cccccc` | viền ô khi hover |
| `ink` | `#000000` | tiêu đề, nhãn, chữ nhập |
| `ink-secondary` | `#31302e` | nhãn checkbox |
| `ink-muted` | `#615d59` | icon mắt |
| `ink-faint` | `#a39e98` | chữ disabled |
| `accent-green` | `#1aae39` | banner thành công |
| `accent-danger` | `#dc2626` | banner lỗi, lỗi trường, viền ô lỗi |

## 4. Dữ liệu mẫu

```json
{
  "title": "Đăng nhập",
  "labels": {
    "email": "Email",
    "password": "Mật khẩu",
    "rememberMe": "Ghi nhớ mật khẩu",
    "forgotPassword": "Quên mật khẩu?",
    "submit": "Đăng nhập"
  },
  "prefill": { "email": "nguyenvana@hrm.vn", "rememberMe": true },
  "reasonBanners": {
    "logged_out": "Đã đăng xuất",
    "password_reset": "Đã đặt lại mật khẩu",
    "password_changed": "Đã đổi mật khẩu, vui lòng đăng nhập lại"
  },
  "errors": {
    "emailRequired": "Nhập email",
    "emailInvalid": "Email không hợp lệ",
    "passwordRequired": "Nhập mật khẩu",
    "server": "Email hoặc mật khẩu không chính xác"
  }
}
```
