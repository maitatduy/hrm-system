# Design brief: đặt lại và đổi mật khẩu

Nguồn: `.docs/ideas/05-change-password-idea.md`, `.docs/frontend-plans/05-change-password-plan.md`. Component dùng chung theo đặc tả ở `01-login-brief.md` mục 2.

## 1. Lưới và bố cục

### Đặt lại mật khẩu (`/reset-password`)
- Giống màn đăng nhập: trang `canvas-soft`, card `max-w-[480px]` căn giữa.
- Card: tiêu đề "Đặt lại mật khẩu", form `flex flex-col gap-4` gồm banner lỗi (nếu có), "Mật khẩu mới", "Nhập lại mật khẩu", nút "Lưu mật khẩu" full chiều rộng `mt-2`.

### Đổi mật khẩu (`/settings`)
- Nằm trong Master Layout, vùng nội dung giới hạn `max-w-xl`.
- `SettingsCard` tiêu đề "Đổi mật khẩu", form gồm "Mật khẩu hiện tại", "Mật khẩu mới", "Nhập lại mật khẩu", nút "Đổi mật khẩu" căn phải `h-10 px-6`.

Không placeholder, không danh sách yêu cầu độ mạnh mật khẩu. Quy tắc chỉ hiện thành dòng lỗi dưới ô khi chưa đạt.

## 2. Đặc tả component

### SettingsCard [SHARED UI]
- Nền `surface`, viền `hairline`, `rounded-lg`, `p-6` (`p-8` từ md), đổ bóng `shadow-xs`.
- Tiêu đề 20px đậm 700 `ink`, ngăn với nội dung bằng viền dưới `hairline`, `pb-4 mb-6`.

### PasswordChangeForm
- Các ô `PasswordInput` theo `01-login-brief.md`.
- Nút lưu bị vô hiệu (nền `hairline`, chữ `ink-faint`) cho tới khi form hợp lệ. Khi gửi chỉ hiện vòng quay.

## 3. Màu sắc

Giống bảng màu ở `01-login-brief.md`. Lỗi trường và banner lỗi dùng `accent-danger` `#dc2626`.

## 4. Dữ liệu mẫu

```json
{
  "reset": {
    "title": "Đặt lại mật khẩu",
    "labels": { "newPassword": "Mật khẩu mới", "confirmPassword": "Nhập lại mật khẩu", "submit": "Lưu mật khẩu" }
  },
  "change": {
    "title": "Đổi mật khẩu",
    "labels": {
      "currentPassword": "Mật khẩu hiện tại",
      "newPassword": "Mật khẩu mới",
      "confirmPassword": "Nhập lại mật khẩu",
      "submit": "Đổi mật khẩu"
    }
  },
  "errors": {
    "weakPassword": "Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
    "mismatch": "Mật khẩu không khớp",
    "sameAsCurrent": "Phải khác mật khẩu hiện tại",
    "wrongCurrent": "Mật khẩu hiện tại không chính xác",
    "resetTokenExpired": "Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn"
  }
}
```
