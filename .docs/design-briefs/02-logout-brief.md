# Design brief: đăng xuất

Nguồn: `.docs/ideas/02-logout-idea.md`, `.docs/frontend-plans/02-logout-plan.md`. Token màu lấy từ `frontend/src/index.css`.

## 1. Lưới và bố cục

- Nút mở menu là ảnh đại diện ở góc phải header.
- Menu thả xuống: neo dưới ảnh đại diện, căn phải, `w-64`, `mt-2`, `z-50`.
- Hộp thoại: nền phủ `fixed inset-0 bg-black/40`, khung căn giữa `max-w-[400px] p-6`, các nút căn phải `gap-3 mt-6`.

## 2. Đặc tả component

### UserAvatar
- Tròn 40px, nền `avatar`, chữ `avatar-ink` 14px đậm 700, hai chữ cái đầu của email viết hoa.
- Focus bằng bàn phím: `ring-2` `primary` 30%.

### Menu tài khoản
- Nền `surface`, viền `hairline`, `rounded-md`, đổ bóng `0 8px 28px rgba(0,0,0,0.1)`, `py-1.5`.
- Đầu menu `UserIdentity`: email 15px đậm 600 `ink`, vai trò 13px `ink-muted`, ngăn với các mục bằng viền dưới `hairline`.
- Mục menu: 15px, `px-4 py-2.5`, hover nền `canvas-soft`. "Đổi mật khẩu" màu `ink`, "Đăng xuất" màu `accent-danger`. Không icon.

### ConfirmDialog [SHARED UI]
- Khung nền `surface`, viền `hairline`, `rounded-lg`, đổ bóng `0 16px 36px rgba(0,0,0,0.14)`.
- Tiêu đề 20px đậm 700 `ink`. Mô tả tùy chọn 15px `ink-muted`, hộp thoại đăng xuất không dùng.
- Nút "Hủy": secondary `h-11 rounded-md`, nền `surface`, viền `hairline`, hover `canvas-soft`.
- Nút "Đăng xuất": danger `h-11 rounded-md`, chữ trắng, nền `accent-danger`, hover `accent-danger-hover`, active `accent-danger-active`. Khi xử lý chỉ hiện vòng quay.

## 3. Màu sắc

| Token | Hex | Dùng cho |
| :-- | :-- | :-- |
| `avatar` | `#d5e3ff` | nền ảnh đại diện |
| `avatar-ink` | `#005db2` | chữ ảnh đại diện |
| `surface` | `#ffffff` | menu, hộp thoại, nút hủy |
| `hairline` | `#e6e6e6` | viền menu, hộp thoại, nút hủy |
| `canvas-soft` | `#f6f5f4` | hover mục menu, hover nút hủy |
| `ink` | `#000000` | email, tiêu đề, mục "Đổi mật khẩu" |
| `ink-muted` | `#615d59` | vai trò |
| `accent-danger` | `#dc2626` | mục và nút "Đăng xuất" |
| `accent-danger-hover` | `#b91c1c` | hover nút đăng xuất |
| `accent-danger-active` | `#991b1b` | nhấn nút đăng xuất |

## 4. Dữ liệu mẫu

```json
{
  "user": { "email": "nguyenvana@hrm.vn", "initials": "NG", "roleLabel": "Nhân sự" },
  "menu": ["Đổi mật khẩu", "Đăng xuất"],
  "dialog": { "title": "Đăng xuất?", "cancel": "Hủy", "confirm": "Đăng xuất" },
  "afterLogoutBanner": "Đã đăng xuất"
}
```
