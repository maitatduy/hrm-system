# Bản quy hoạch kỹ thuật Frontend: Bố cục toàn cục (Master Layout)

Tài liệu quy hoạch kỹ thuật cho khung giao diện dùng chung (Master Layout) của hệ thống HRM System, tích hợp các ràng buộc từ `.docs/ideas/00-master-layout-idea.md`, `.docs/DESIGN.md`, và `.agent/rules/frontend-standards.md`.

---

## 1. Phân rã component

### 1.1. Sơ đồ cây phân cấp component (Component Hierarchy)

```
MasterLayout [SMART]
├── HeaderContainer [SMART]
│   ├── MobileNavToggle [DUMB] [SHARED UI]
│   ├── AppLogo [DUMB] [SHARED UI]
│   └── HeaderActions [DUMB]
│       ├── NotificationBellContainer [SMART]
│       │   ├── NotificationIconBtn [DUMB] [SHARED UI]
│       │   ├── NotificationBadge [DUMB] [SHARED UI]
│       │   └── NotificationQuickPopover [DUMB]
│       └── UserProfileContainer [SMART]
│           ├── UserAvatar [DUMB] [SHARED UI]
│           ├── UserInfoDisplay [DUMB]
│           └── UserProfileDropdown [DUMB] [SHARED UI]
├── SidebarContainer [SMART]
│   ├── DesktopSidebar [DUMB]
│   │   ├── SidebarHeader [DUMB]
│   │   ├── SidebarNavList [DUMB]
│   │   │   └── SidebarNavItem [DUMB]
│   │   └── SidebarCollapseToggle [DUMB] [SHARED UI]
│   └── MobileSidebarDrawer [DUMB] [SHARED UI]
│       ├── DrawerHeader [DUMB]
│       └── SidebarNavList [DUMB]
│           └── SidebarNavItem [DUMB]
├── MainContentArea [DUMB]
│   └── <Outlet /> (React Router)
└── AppFooter [DUMB]
```

### 1.2. Danh sách và phân loại chi tiết component

| Component                   | Phân loại | Khả năng tái sử dụng (Shared UI) | Trách nhiệm kỹ thuật & Ràng buộc Design Token                                                                                                                                                                                                           |
| :-------------------------- | :-------- | :------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `MasterLayout`              | `[SMART]` | Không (Layout Shell)             | Layout cha, subscribe store trạng thái sidebar collapsed/expanded, tính toán grid/flex layout tổng thể, điều phối `Outlet`.                                                                                                                             |
| `HeaderContainer`           | `[SMART]` | Không                            | Header dính cố định (`fixed top-0`, `z-40`, chiều cao `h-16`, nền surface `#ffffff`, viền dưới hairline `#e6e6e6`).                                                                                                                                     |
| `MobileNavToggle`           | `[DUMB]`  | Có (`[SHARED UI]`)               | Nút hamburger icon cho thiết bị mobile/tablet (< 1024px), kích thước chuẩn 40x40px, bo góc `rounded-md` (8px).                                                                                                                                          |
| `AppLogo`                   | `[DUMB]`  | Có (`[SHARED UI]`)               | Hiển thị biểu tượng HRM và tên thương hiệu, chuyển hướng về trang dashboard mặc định.                                                                                                                                                                   |
| `HeaderActions`             | `[DUMB]`  | Không                            | Vùng căn phải chứa các nút chức năng nhanh (thông báo, user profile), layout flex gap `spacing-md` (16px).                                                                                                                                              |
| `NotificationBellContainer` | `[SMART]` | Không                            | Gọi TanStack Query lấy số thông báo chưa đọc (`unread-count`), quản lý state đóng/mở popover thông báo nhanh.                                                                                                                                           |
| `NotificationIconBtn`       | `[DUMB]`  | Có (`[SHARED UI]`)               | Nút icon chuông viền hairline hoặc ghost button, bo tròn `rounded-full`, hiệu ứng hover êm ái.                                                                                                                                                          |
| `NotificationBadge`         | `[DUMB]`  | Có (`[SHARED UI]`)               | Badge số đếm pill `rounded-full`, nền cam `accent-orange` (#dd5b00) hoặc đỏ `accent-danger` (#dc2626), chữ trắng typography `caption` (12px).                                                                                                           |
| `NotificationQuickPopover`  | `[DUMB]`  | Không                            | Khung popover hiển thị danh sách 5 thông báo mới nhất, nền surface `#ffffff`, bo góc `rounded-lg` (12px), viền hairline `#e6e6e6`.                                                                                                                      |
| `UserProfileContainer`      | `[SMART]` | Không                            | Gọi TanStack Query lấy profile người dùng (`useCurrentUser`), xử lý action logout (xóa token và chuyển hướng).                                                                                                                                          |
| `UserAvatar`                | `[DUMB]`  | Có (`[SHARED UI]`)               | Avatar người dùng hình vuông bo tròn đầy đủ (`rounded-full`), fallback hiển thị ký tự viết tắt họ tên.                                                                                                                                                  |
| `UserInfoDisplay`           | `[DUMB]`  | Không                            | Hiển thị họ tên (chữ chính `ink` #000000, font `body-md` 400) và vai trò (chữ phụ `ink-muted` #615d59, font `caption` 12px).                                                                                                                            |
| `UserProfileDropdown`       | `[DUMB]`  | Có (`[SHARED UI]`)               | Menu dropdown với các tùy chọn: Đổi mật khẩu, Hồ sơ cá nhân, Đăng xuất. Nền surface `#ffffff`, bo góc `rounded-md` (8px).                                                                                                                               |
| `SidebarContainer`          | `[SMART]` | Không                            | Đọc thông tin role từ TanStack Query, lọc danh sách navigation routes theo role người dùng, quản lý đóng/mở drawer mobile.                                                                                                                              |
| `DesktopSidebar`            | `[DUMB]`  | Không                            | Sidebar cố định bên trái (`fixed left-0 top-0 bottom-0`, `z-30`), nền surface `#ffffff`, viền phải hairline `#e6e6e6`. Độ rộng linh hoạt `w-64` (mở) hoặc `w-20` (thu gọn).                                                                             |
| `MobileSidebarDrawer`       | `[DUMB]`  | Có (`[SHARED UI]`)               | Sheet/Drawer trượt từ cạnh trái sang trên mobile màn hình < 1024px, có backdrop che nền `canvas-soft`.                                                                                                                                                  |
| `SidebarHeader`             | `[DUMB]`  | Không                            | Khu vực logo hoặc tiêu đề sidebar căn thẳng hàng với Header (cao `h-16`), có hairline phân cách.                                                                                                                                                        |
| `SidebarNavList`            | `[DUMB]`  | Không                            | Danh sách cuộn chứa các menu items, padding `spacing-sm` (8px), gap `spacing-xs` (4px).                                                                                                                                                                 |
| `SidebarNavItem`            | `[DUMB]`  | Không                            | **Tuân thủ DESIGN.md:** Khi active, dùng thanh chỉ báo bên trái màu primary `#0075de` (dày 3px hoặc 4px), chữ đổi sang `ink` (#000000) hoặc primary. **Tuyệt đối không đổi nền toàn bộ hàng**. Khi hover, áp dụng nền sáng nhẹ `canvas-soft` (#f6f5f4). |
| `SidebarCollapseToggle`     | `[DUMB]`  | Có (`[SHARED UI]`)               | Nút thu gọn / mở rộng sidebar ở cuối danh sách, icon mũi tên đảo chiều (`ChevronLeft` / `ChevronRight`).                                                                                                                                                |
| `MainContentArea`           | `[DUMB]`  | Không                            | Vùng chứa nội dung trang (`<Outlet />`), dịch lề tương ứng với sidebar (`ml-64` hoặc `ml-20`), padding `spacing-lg` (24px), nền `canvas-soft` (#f6f5f4), min-h-screen.                                                                                  |
| `AppFooter`                 | `[DUMB]`  | Không                            | Footer chân trang, nền `surface` hoặc trong suốt, hiển thị bản quyền và số phiên bản hệ thống, chữ màu `ink-faint` (#a39e98), typography `caption` (12px).                                                                                              |

---

## 2. Quản lý trạng thái (State Management)

Toàn bộ trạng thái của Master Layout được phân định rành mạch theo 3 tầng kiến trúc, ngăn chặn việc lạm dụng global state:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TẦNG QUẢN LÝ TRẠNG THÁI                         │
├─────────────────────┬──────────────────────┬───────────────────────────┤
│ 1. LOCAL STATE      │ 2. SERVER STATE      │ 3. GLOBAL STATE           │
│ (React useState)    │ (TanStack Query)     │ (Zustand Store)           │
├─────────────────────┼──────────────────────┼───────────────────────────┤
│ - isMobileMenuOpen  │ - ['auth', 'me']     │ - isSidebarCollapsed      │
│ - isProfileMenuOpen │ - ['notifications',  │   (persist localStorage)  │
│ - isNotifPopoverOpen│    'unread-count']   │                           │
└─────────────────────┴──────────────────────┴───────────────────────────┘
```

### 2.1. State cục bộ (Local State - `useState`)

Áp dụng cho các trạng thái giao diện có vòng đời ngắn, chỉ ảnh hưởng đến đúng component đó và tự hủy khi đóng giao diện:

- `isMobileMenuOpen` (`boolean`): Trạng thái hiển thị drawer menu trượt trên mobile/tablet. Quản lý tại `SidebarContainer`.
- `isProfileDropdownOpen` (`boolean`): Trạng thái mở dropdown thao tác người dùng (Đổi mật khẩu / Đăng xuất). Quản lý tại `UserProfileContainer`.
- `isNotificationPopoverOpen` (`boolean`): Trạng thái bật/tắt popover xem nhanh thông báo. Quản lý tại `NotificationBellContainer`.

### 2.2. State máy chủ (Server State - `TanStack Query`)

**Quy tắc:** Dữ liệu có nguồn gốc từ API máy chủ chỉ lưu và quản lý cache qua TanStack Query, **tuyệt đối không sao chép lưu vào Zustand**.

- **`['auth', 'me']`** qua hook `useCurrentUser()`:
  - Nguồn dữ liệu: `GET /api/v1/auth/me` (thông qua Gateway).
  - Mục đích: Lấy danh tính người dùng (`fullName`, `avatarUrl`, `roles`). Dùng để:
    1. Kiểm tra quyền và lọc các menu items trên Sidebar (`ADMIN`, `HR`, `MANAGER`, `EMPLOYEE`).
    2. Hiển thị avatar và tên trên Header.
  - Cấu hình Cache: `staleTime: 5 * 60 * 1000` (5 phút), `gcTime: 10 * 60 * 1000`.
- **`['notifications', 'unread-count']`** qua hook `useUnreadNotificationCount()`:
  - Nguồn dữ liệu: `GET /api/v1/notifications/unread-count`.
  - Mục đích: Hiển thị badge đỏ/cam trên chuông thông báo.
  - Cấu hình Cache: `staleTime: 60 * 1000` (1 phút), `refetchInterval: 60 * 1000` (polling định kỳ nhẹ).

### 2.3. State toàn cục (Global Client State - `Zustand`)

Chỉ lưu trữ các trạng thái giao diện client-side thuần túy cần chia sẻ xuyên suốt các màn hình và cần lưu lại (persist):

- **`useLayoutStore`**:
  - `isSidebarCollapsed` (`boolean`): Trạng thái thu nhỏ sidebar trên màn hình desktop thành icon-only để mở rộng không gian làm việc.
  - Hành động: `toggleSidebarCollapse()`, `setSidebarCollapse(value: boolean)`.
  - Persistence: Đồng bộ với `localStorage` với key `hrm_sidebar_collapsed` để giữ nguyên trạng thái khi người dùng reload trang.
- _(Lưu ý về Auth Token)_: `useAuthStore` chỉ lưu trữ `accessToken` trong memory/cookie để gắn vào axios interceptor; toàn bộ dữ liệu thực thể người dùng giao cho TanStack Query quản lý như đã định nghĩa ở mục 2.2.

### 2.4. Trạng thái tham số URL (URL Query Parameters)

- Master Layout không lưu trạng thái đóng/mở sidebar hay popover vào URL query parameter để tránh làm ô nhiễm lịch sử duyệt web (`history stack`).
- Hỗ trợ deep-link điều hướng thông báo: Trường hợp người dùng click vào một thông báo cụ thể từ popover, router điều hướng đến module đích kèm query parameter để mở chi tiết (ví dụ: `/leave-requests?requestId=UUID` mở Drawer duyệt phép theo đúng UX tại `DESIGN.md`).

---

## 3. Cấu trúc dữ liệu & TypeScript Interfaces

Định nghĩa kiểu nghiêm ngặt theo chuẩn `frontend-standards.md`, **không sử dụng kiểu `any`**.

### 3.1. Kiểu dữ liệu nền tảng (Domain & System Types)

```typescript
import type { ComponentType, ReactNode } from "react";

/**
 * Các vai trò người dùng trong hệ thống HRM theo ARCHITECTURE.md
 */
export type UserRole = "ADMIN" | "HR" | "MANAGER" | "EMPLOYEE";

/**
 * Thông tin người dùng đăng nhập trả về từ API /api/v1/auth/me
 */
export interface CurrentUserProfile {
  readonly id: string;
  readonly employeeId: string;
  readonly fullName: string;
  readonly email: string;
  readonly avatarUrl?: string | null;
  readonly roles: readonly UserRole[];
}

/**
 * Cấu hình một mục điều hướng trên Sidebar
 */
export interface NavItemConfig {
  readonly id: string;
  readonly label: string;
  readonly path: string;
  readonly icon: ComponentType<{ readonly className?: string }>;
  readonly allowedRoles: readonly UserRole[];
  readonly badgeCount?: number;
}
```

### 3.2. Cấu trúc Props cho các Dumb Components cốt lõi

```typescript
/**
 * Props cho UserAvatar (Shared UI)
 */
export interface UserAvatarProps {
  readonly fullName: string;
  readonly avatarUrl?: string | null;
  readonly size?: "sm" | "md" | "lg";
  readonly className?: string;
}

/**
 * Props cho NotificationBadge (Shared UI)
 */
export interface NotificationBadgeProps {
  readonly count: number;
  readonly maxDisplay?: number;
  readonly className?: string;
}

/**
 * Props cho UserProfileDropdown (Shared UI)
 */
export interface UserProfileDropdownProps {
  readonly user: CurrentUserProfile;
  readonly isOpen: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onNavigateProfile: () => void;
  readonly onNavigateChangePassword: () => void;
  readonly onLogout: () => void;
}

/**
 * Props cho NotificationQuickPopover
 */
export interface NotificationQuickPopoverProps {
  readonly isOpen: boolean;
  readonly unreadCount: number;
  readonly onOpenChange: (open: boolean) => void;
  readonly onViewAllNotifications: () => void;
  readonly onNotificationClick: (notificationId: string) => void;
}

/**
 * Props cho SidebarNavItem (Thành phần menu con)
 * Ràng buộc Design Token: Mục active có vạch chỉ báo primary #0075de bên trái.
 */
export interface SidebarNavItemProps {
  readonly item: NavItemConfig;
  readonly isActive: boolean;
  readonly isCollapsed: boolean;
  readonly onNavigate: (path: string) => void;
}

/**
 * Props cho SidebarNavList
 */
export interface SidebarNavListProps {
  readonly items: readonly NavItemConfig[];
  readonly currentPath: string;
  readonly isCollapsed: boolean;
  readonly onNavigate: (path: string) => void;
}

/**
 * Props cho DesktopSidebar
 */
export interface DesktopSidebarProps {
  readonly navItems: readonly NavItemConfig[];
  readonly currentPath: string;
  readonly isCollapsed: boolean;
  readonly onToggleCollapse: () => void;
  readonly onNavigate: (path: string) => void;
}

/**
 * Props cho MobileSidebarDrawer (Shared UI)
 */
export interface MobileSidebarDrawerProps {
  readonly isOpen: boolean;
  readonly navItems: readonly NavItemConfig[];
  readonly currentPath: string;
  readonly onClose: () => void;
  readonly onNavigate: (path: string) => void;
}

/**
 * Props cho MainContentArea
 */
export interface MainContentAreaProps {
  readonly isSidebarCollapsed: boolean;
  readonly children: ReactNode;
}

/**
 * Props cho AppFooter
 */
export interface AppFooterProps {
  readonly systemName: string;
  readonly version: string;
  readonly releaseYear: number;
}
```

### 3.3. Đặc tả Store Zustand (`useLayoutStore`)

```typescript
export interface LayoutState {
  readonly isSidebarCollapsed: boolean;
  readonly toggleSidebarCollapse: () => void;
  readonly setSidebarCollapse: (collapsed: boolean) => void;
}
```

---

## 4. Kế hoạch triển khai & Kiểm thử (Checklist)

1. **Khởi tạo Shared UI Tokens**: Cài đặt các component nền tảng từ shadcn/ui (`Button`, `DropdownMenu`, `Sheet`, `Popover`, `Avatar`, `Badge`), tinh chỉnh theo mã màu token tại `.docs/DESIGN.md` (Primary `#0075de`, Hairline `#e6e6e6`, Canvas `#f6f5f4`, Text `ink` `#000000`).
2. **Xây dựng NavConfig & RBAC Filter**: Định nghĩa mảng routes chứa 4 module chính (`/employees`, `/attendance`, `/leave-requests`, `/payroll`), viết utility function lọc danh sách menu dựa theo `roles` của người dùng.
3. **Hiện thực Sidebar NavItem Active State**: Đảm bảo hiệu ứng active bằng CSS border-l-4 màu `#0075de`, không thay đổi background toàn hàng.
4. **Unit Test & Integration Test**:
   - Viết test kiểm tra RBAC filtering: Đảm bảo role `EMPLOYEE` không thấy mục `/payroll`.
   - Viết test cho `SidebarNavItem`: Kiểm tra render đúng vạch chỉ báo primary khi `isActive = true`.
   - Viết test cho `useLayoutStore`: Đảm bảo giá trị collapse đồng bộ đúng vào `localStorage`.
