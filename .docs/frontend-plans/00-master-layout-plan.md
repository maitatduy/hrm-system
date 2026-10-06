# Kế hoạch frontend: bố cục toàn cục (Master Layout)

Nguồn: `.docs/ideas/00-master-layout-idea.md`. Code: `frontend/src/routes/`.

## 1. Phân rã component

```
AppRoutes                         routes/AppRoutes.tsx
├── GuestRoute [SMART]            /login, /forgot-password, /verify-otp, /reset-password
└── ProtectedRoute [SMART]        allowedRoles tuỳ chọn
    ├── RoleHomeRedirect [SMART]  "/" → trang chủ theo vai trò
    └── DashboardLayout [SMART]   routes/DashboardLayout.tsx
        ├── header
        │   ├── Link "HRM System"
        │   └── UserMenu [SMART]          features/auth/components/UserMenu.tsx
        ├── aside > nav > NavLink[]       Tổng quan, Cài đặt
        └── main > Outlet
            ├── DashboardPage [DUMB]      routes/pages/DashboardPage.tsx
            └── SettingsPage [DUMB]       routes/pages/SettingsPage.tsx
```

| Route | Quyền | Trang |
| :-- | :-- | :-- |
| `/` | đã đăng nhập | chuyển về trang chủ theo vai trò |
| `/dashboard` | ADMIN, HR | DashboardPage "Tổng quan quản trị nhân sự" |
| `/management/dashboard` | MANAGER | DashboardPage "Tổng quan quản lý" |
| `/portal/dashboard` | mọi vai trò | DashboardPage "Cổng nhân viên" |
| `/settings` | mọi vai trò | SettingsPage |
| `*` | | chuyển về `/` |

- `ProtectedRoute`: chưa đăng nhập thì về `/login?redirect=<đường dẫn hiện tại>`. Có token nhưng chưa có thông tin người dùng (sau F5) thì gọi `GET /api/auth/me`, lúc chờ hiện "Đang tải...", lỗi thì hiện "Không tải được phiên đăng nhập" kèm nút "Thử lại". Sai vai trò thì về trang chủ của vai trò đó.
- Sidebar chỉ hiện mục đã có trang, mục đang chọn xác định bằng `NavLink`.
- Message dùng chung nằm ở `frontend/src/constants/messages.ts`.

## 2. Quản lý trạng thái

| State | Tầng | Ghi chú |
| :-- | :-- | :-- |
| `accessToken`, `isAuthenticated`, `sessionUser` | Zustand `features/auth/store.ts` | dùng chung mọi màn |
| Thông tin người dùng hiện tại | TanStack Query `["auth", "me"]` | queryFn ghi luôn vào store |
| Mở menu tài khoản, mở hộp thoại đăng xuất | `useState` trong `UserMenu` | cục bộ |
| Đường dẫn quay lại sau đăng nhập | URL `?redirect=` | chỉ nhận path nội bộ |

## 3. Cấu trúc dữ liệu

```ts
type UserRole = "ADMIN" | "HR" | "MANAGER" | "EMPLOYEE";

interface AuthUserSession {
    readonly id: string;
    readonly email: string;
    readonly role: UserRole;
    readonly status: "ACTIVE" | "LOCKED";
    readonly employeeId: string | null;
    readonly lastLoginAt: string | null; // UTC
}

interface ProtectedRouteProps {
    readonly allowedRoles?: readonly UserRole[];
}

interface NavItem {
    readonly label: string;
    readonly to: string;
}

interface DashboardPageProps {
    readonly title: string;
}
```

## 4. Chưa triển khai

Tìm kiếm, breadcrumb, thông báo, thu gọn sidebar, badge số lượng, trợ lý AI, menu các module nghiệp vụ.
