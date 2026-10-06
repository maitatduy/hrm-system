# Kế hoạch frontend: đăng xuất

Nguồn: `.docs/ideas/02-logout-idea.md`. Code: `frontend/src/features/auth/components/`.

## 1. Phân rã component

```
DashboardLayout header
└── UserMenu [SMART]                          UserMenu.tsx
    ├── button > UserAvatar [DUMB]            hai chữ cái đầu email
    ├── menu (khi mở)
    │   ├── UserIdentity [DUMB]               email, vai trò
    │   ├── Link "Đổi mật khẩu" → /settings
    │   └── button "Đăng xuất"
    └── LogoutDialogContainer [SMART]
        └── ConfirmDialog [DUMB] [SHARED UI]   tiêu đề, mô tả kèm email, Hủy / Đăng xuất
```

- `UserMenu`: đóng menu khi bấm ra ngoài hoặc nhấn Esc.
- `ConfirmDialog`: đóng khi nhấn Esc hoặc bấm nền phủ, trừ lúc đang xử lý. Khóa cuộn trang khi mở.
- `LogoutDialogContainer`: lấy email từ `sessionUser` trong store, tiêu đề và mô tả lấy từ `AUTH_MESSAGES` (`LOGOUT_CONFIRM_TITLE`, `logoutConfirm(email)`, `LOGOUT_CONFIRM_DEFAULT` khi chưa có email).
- `useLogoutMutation(reason)`: `POST /api/auth/logout`. Trong `onSettled` luôn `clearAuth()`, `queryClient.clear()` rồi điều hướng `/login?reason=<reason>`.

## 2. Quản lý trạng thái

| State | Tầng |
| :-- | :-- |
| `isMenuOpen`, `isLogoutDialogOpen` | `useState` trong `UserMenu` |
| Đang đăng xuất | `useMutation().isPending` |
| Phiên | Zustand, xóa khi đăng xuất |

## 3. Cấu trúc dữ liệu

```ts
type LoginRedirectReason = "logged_out" | "password_reset" | "password_changed";

interface ConfirmDialogProps {
    readonly isOpen: boolean;
    readonly title: string;
    readonly description?: string;
    readonly confirmLabel?: string; // mặc định "Xác nhận"
    readonly cancelLabel?: string; // mặc định "Hủy"
    readonly isLoading?: boolean;
    readonly variant?: "danger" | "primary";
    readonly onConfirm: () => void;
    readonly onCancel: () => void;
}

interface UserAvatarProps {
    readonly email?: string;
    readonly className?: string;
}

interface UserIdentityProps {
    readonly user: AuthUserSession | null;
    readonly className?: string;
}
```
