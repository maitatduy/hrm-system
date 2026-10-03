# Bản quy hoạch kỹ thuật Frontend: Bố cục toàn cục (Master Layout)

Tài liệu quy hoạch kỹ thuật cho khung giao diện dùng chung (Master Layout) của hệ thống HRM System, tích hợp các ràng buộc từ `.docs/ideas/00-master-layout-idea.md`, `.docs/DESIGN.md`, và `.agent/rules/frontend-standards.md`.

---

## 1. Phân rã component

### 1.1. Sơ đồ cây phân cấp component (Component Tree)

```
MasterLayout [SMART]
├── DesktopSidebar [SMART]
│   ├── SidebarLogo [DUMB] [SHARED UI]
│   ├── SidebarNavList [DUMB]
│   │   └── SidebarNavItem [DUMB]
│   │       └── NavPendingBadge [DUMB] [SHARED UI]
│   └── SidebarUserProfile [DUMB]
│       ├── UserAvatar [DUMB] [SHARED UI]
│       └── UserMetaInfo [DUMB]
├── MobileSidebarDrawer [SMART] [SHARED UI]
│   ├── DrawerBackdrop [DUMB]
│   ├── SidebarLogo [DUMB] [SHARED UI]
│   ├── SidebarNavList [DUMB]
│   │   └── SidebarNavItem [DUMB]
│   │       └── NavPendingBadge [DUMB] [SHARED UI]
│   └── SidebarUserProfile [DUMB]
│       ├── UserAvatar [DUMB] [SHARED UI]
│       └── UserMetaInfo [DUMB]
├── HeaderContainer [SMART]
│   ├── HeaderLeftSection [DUMB]
│   │   ├── HamburgerButton [DUMB] [SHARED UI]
│   │   ├── GlobalSearchBar [SMART]
│   │   │   ├── SearchInput [DUMB] [SHARED UI]
│   │   │   └── QuickSearchResultList [DUMB]
│   │   └── BreadcrumbNavigation [DUMB] [SHARED UI]
│   └── HeaderRightSection [DUMB]
│       ├── NotificationDropdownContainer [SMART]
│       │   ├── NotificationTriggerBtn [DUMB] [SHARED UI]
│       │   │   └── NotificationUnreadBadge [DUMB] [SHARED UI]
│       │   └── NotificationDropdownList [DUMB]
│       │       ├── NotificationHeader [DUMB]
│       │       ├── NotificationItem [DUMB]
│       │       │   ├── NotificationTypeIcon [DUMB]
│       │       │   └── UnreadDotIndicator [DUMB]
│       │       └── NotificationFooter [DUMB]
│       └── CurrentDateDisplay [DUMB] [SHARED UI]
├── MainContentArea [DUMB]
│   └── <Outlet /> (React Router)
└── AIAssistantWidgetContainer [SMART]
    ├── AIAssistantTriggerButton [DUMB] [SHARED UI]
    └── AIAssistantChatDrawer [DUMB]
        ├── AIChatHeader [DUMB]
        ├── AIMessageList [DUMB]
        │   └── AIMessageBubble [DUMB]
        └── AIChatInputBar [DUMB]
```

### 1.2. Danh sách và phân loại chi tiết component

| Component | Phân loại | Khả năng tái sử dụng (Shared UI) | Trách nhiệm kỹ thuật & Ràng buộc Design Token |
| :--- | :--- | :--- | :--- |
| `MasterLayout` | `[SMART]` | Không (Layout Shell) | Lớp bao ngoài toàn hệ thống, đọc `isSidebarCollapsed` từ `useLayoutStore` để căn chỉnh lề nội dung, render Sidebar, Header, Content (`<Outlet />`), và AI Assistant Widget. |
| `DesktopSidebar` | `[SMART]` | Không | Sidebar cố định bên trái màn hình desktop (`fixed left-0 top-0 bottom-0 w-64`, có thể thu gọn `w-20` theo state), nền `bg-white`, viền phải `border-r border-gray-200`. Đọc dữ liệu user và pending counts từ TanStack Query để truyền xuống danh sách menu. |
| `SidebarLogo` | `[DUMB]` | Có (`[SHARED UI]`) | Logo khối vuông bo góc `rounded-lg` nền `bg-blue-600` chứa chữ viết tắt, cạnh đó là tên hệ thống (`text-gray-900 font-bold`) và dòng mô tả nhỏ (`text-gray-500 text-xs`). Khi thu gọn chỉ hiển thị khối vuông logo. |
| `SidebarNavList` | `[DUMB]` | Không | Danh sách menu điều hướng dọc, padding `p-3`, khoảng cách các mục `space-y-1`. Hỗ trợ cuộn độc lập nếu danh sách dài. |
| `SidebarNavItem` | `[DUMB]` | Không | Mục menu đơn lẻ. **Ràng buộc DESIGN.md:** Khi active có nền `bg-blue-50` chữ `text-blue-600 font-medium`. Khi unselected có chữ `text-gray-700`, hover đổi nền `bg-gray-50`. Bo góc `rounded-lg`, padding `px-3 py-2.5`. |
| `NavPendingBadge` | `[DUMB]` | Có (`[SHARED UI]`) | Badge số lượng cần xử lý dạng pill tròn nhỏ màu vàng `bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full` ở cuối dòng menu (ví dụ đơn nghỉ phép chờ duyệt). |
| `SidebarUserProfile` | `[DUMB]` | Không | Khối thông tin người dùng ở đáy sidebar, ngăn cách bằng viền trên `border-t border-gray-200`, padding `p-4 flex items-center gap-3`. |
| `UserAvatar` | `[DUMB]` | Có (`[SHARED UI]`) | Avatar hình tròn `rounded-full`, nền gradient `bg-gradient-to-br from-blue-500 to-purple-600`, hiển thị chữ trắng in hoa ký tự cuối của tên người dùng theo đúng `DESIGN.md`. |
| `UserMetaInfo` | `[DUMB]` | Không | Hiển thị tên (`text-sm font-medium text-gray-900 truncate`) và email (`text-xs text-gray-500 truncate`). Ẩn khi sidebar ở trạng thái collapsed. |
| `MobileSidebarDrawer` | `[SMART]` | Có (`[SHARED UI]`) | Sheet/Drawer sidebar trượt từ cạnh trái ra trên thiết bị di động (< 1024px), quản lý qua state `isMobileDrawerOpen` từ Zustand. Có lớp phủ backdrop che mờ nền `bg-black/50`. |
| `HeaderContainer` | `[SMART]` | Không | Header dính trên cùng (`sticky top-0 z-30`), nền `bg-white`, viền dưới `border-b border-gray-200`, chiều cao `h-16`, flexbox căn giữa hai bên trái - phải. |
| `HeaderLeftSection` | `[DUMB]` | Không | Vùng chứa nút hamburger, ô tìm kiếm và breadcrumb, layout `flex items-center gap-4`. |
| `HamburgerButton` | `[DUMB]` | Có (`[SHARED UI]`) | Nút bật/tắt thu gọn sidebar trên desktop hoặc mở drawer trên mobile. Bo góc `rounded-lg`, viền `border border-gray-200`, nền `bg-white`, chữ `text-gray-700`, hover: `bg-gray-50`. |
| `GlobalSearchBar` | `[SMART]` | Không | Quản lý state chuỗi tìm kiếm nhanh, xử lý sự kiện nhấn Enter để điều hướng tới route nghiệp vụ tương ứng (`/employees?search=...`, `/leave-requests?query=...`). |
| `SearchInput` | `[DUMB]` | Có (`[SHARED UI]`) | Input tìm kiếm có icon kính lúp bên trái, bo góc `rounded-lg`, viền `border border-gray-200`, chữ `text-gray-900`, placeholder `text-gray-400`, focus viền xanh `focus:border-blue-600 focus:ring-1 focus:ring-blue-600`. |
| `BreadcrumbNavigation` | `[DUMB]` | Có (`[SHARED UI]`) | Điều hướng breadcrumb tên trang hiện tại, chữ phân cấp `text-gray-500` và trang hiện tại `text-gray-900 font-medium`. |
| `HeaderRightSection` | `[DUMB]` | Không | Vùng chứa chuông thông báo và khối hiển thị ngày, layout `flex items-center gap-4`. |
| `NotificationDropdownContainer` | `[SMART]` | Không | Quản lý đóng/mở popover thông báo, gọi TanStack Query lấy danh sách thông báo và số lượng chưa đọc, mutate đánh dấu đã đọc. |
| `NotificationTriggerBtn` | `[DUMB]` | Có (`[SHARED UI]`) | Nút icon chuông bo góc `rounded-lg`, viền `border border-gray-200`, nền `bg-white`, hover `bg-gray-50`. Vị trí tương đối để gắn badge. |
| `NotificationUnreadBadge` | `[DUMB]` | Có (`[SHARED UI]`) | Chấm đỏ báo số lượng chưa đọc gắn góc trên phải icon chuông, nền `bg-red-600 text-white rounded-full text-xs font-semibold px-1.5 py-0.5`. |
| `NotificationDropdownList` | `[DUMB]` | Không | Khung dropdown danh sách thông báo, nền `bg-white`, bo góc `rounded-xl`, viền `border border-gray-200`, bóng đổ `shadow-lg`, chiều rộng `w-80` hoặc `w-96`. |
| `NotificationItem` | `[DUMB]` | Không | Dòng thông báo đơn lẻ. Dòng chưa đọc có nền xanh nhạt `bg-blue-50`, chấm xanh nhỏ `w-2 h-2 rounded-full bg-blue-600`. Dòng đã đọc nền trắng. Hover `hover:bg-gray-50`. |
| `NotificationTypeIcon` | `[DUMB]` | Không | Icon tròn bo `rounded-full` mang màu minh họa theo loại sự kiện (`bg-blue-100 text-blue-800`, `bg-green-100 text-green-800`, `bg-yellow-100 text-yellow-800`, `bg-red-100 text-red-800`). |
| `CurrentDateDisplay` | `[DUMB]` | Có (`[SHARED UI]`) | Hiển thị ngày hiện tại định dạng thứ, ngày/tháng/năm, chữ `text-sm font-medium text-gray-600`, icon lịch nhỏ đi kèm. |
| `MainContentArea` | `[DUMB]` | Không | Khu vực cuộn chính của trang, nền `bg-gray-50`, padding chuẩn `p-6`, dịch chuyển lề trái linh hoạt tương ứng với bề rộng sidebar (`ml-64` hoặc `ml-20` trên desktop, `ml-0` trên mobile). Chứa `<Outlet />`. |
| `AIAssistantWidgetContainer` | `[SMART]` | Không | Quản lý state mở/đóng widget chat AI, gọi API trò chuyện hoặc phân tích qua TanStack Query Mutation. Vị trí cố định `fixed bottom-6 right-6 z-40`, hoàn toàn độc lập với luồng cuộn trang chính. |
| `AIAssistantTriggerButton` | `[DUMB]` | Có (`[SHARED UI]`) | Nút tròn nổi bật kích thước `w-14 h-14 rounded-full`, nền gradient độc quyền AI `bg-gradient-to-r from-purple-600 to-blue-600`, icon ngôi sao/robot màu trắng, hiệu ứng `shadow-lg hover:shadow-xl hover:scale-105 transition-all`. |
| `AIAssistantChatDrawer` | `[DUMB]` | Không | Cửa sổ hội thoại AI nổi kích thước `w-96 h-[500px]`, nền `bg-white`, bo góc `rounded-2xl`, viền `border border-gray-200`, bóng đổ `shadow-2xl flex flex-col`. |

---

## 2. Quản lý trạng thái (State Management)

Kiến trúc quản lý trạng thái tuân thủ nghiêm ngặt 3 tầng phân lập:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TẦNG QUẢN LÝ TRẠNG THÁI                         │
├─────────────────────┬──────────────────────┬───────────────────────────┤
│ 1. LOCAL STATE      │ 2. SERVER STATE      │ 3. GLOBAL STATE           │
│ (React useState)    │ (TanStack Query)     │ (Zustand Store)           │
├─────────────────────┼──────────────────────┼───────────────────────────┤
│ - isNotifOpen       │ - ['auth', 'me']     │ - isSidebarCollapsed      │
│ - isAIChatOpen      │ - ['notifications']  │   (persist localStorage)  │
│ - searchKeyword     │ - ['notifications',  │ - isMobileDrawerOpen      │
│ - aiDraftMessage    │    'unread-count']   │                           │
│                     │ - ['menu-pending']   │                           │
└─────────────────────┴──────────────────────┴───────────────────────────┘
```

### 2.1. State cục bộ (Local State - `useState`)

Dành riêng cho trạng thái hiển thị giao diện tức thời tại một component, không ảnh hưởng đến component khác:
- `isNotificationOpen` (`boolean`): Trạng thái mở/đóng dropdown thông báo trong `NotificationDropdownContainer`.
- `searchKeyword` (`string`): Giá trị gõ tức thời trong ô tìm kiếm tại `GlobalSearchBar` trước khi bấm Enter.
- `isAIChatOpen` (`boolean`): Trạng thái bung cửa sổ chat AI tại `AIAssistantWidgetContainer`.
- `aiDraftMessage` (`string`): Văn bản người dùng đang nhập trong input của widget AI.

### 2.2. State máy chủ (Server State - `TanStack Query`)

Dữ liệu có nguồn gốc từ backend qua API Gateway, được quản lý bộ nhớ đệm và tự động invalidate/refetch bằng TanStack Query. **Tuyệt đối không lưu bản sao dữ liệu này vào Zustand.**

1. **`['auth', 'me']`** qua hook `useCurrentUserQuery()`:
   - Endpoint: `GET /api/auth/me`
   - Mục đích: Lấy `fullName`, `email`, `roles` của người dùng đăng nhập để hiển thị khối thông tin dưới sidebar và kiểm tra phân quyền hiển thị menu (RBAC).
   - Cấu hình: `staleTime: 10 * 60 * 1000` (10 phút), `gcTime: 15 * 60 * 1000`.

2. **`['notifications', 'unread-count']`** qua hook `useUnreadNotificationCountQuery()`:
   - Endpoint: `GET /api/notifications/unread-count`
   - Mục đích: Hiển thị chấm đỏ số lượng trên icon chuông.
   - Cấu hình: `staleTime: 30 * 1000`, `refetchInterval: 60 * 1000` (tự động cập nhật mỗi phút).

3. **`['notifications']`** qua hook `useNotificationsQuery()`:
   - Endpoint: `GET /api/notifications`
   - Mục đích: Hiển thị 5-10 thông báo mới nhất trong dropdown.
   - Kích hoạt: Chỉ fetch khi `isNotificationOpen === true` (`enabled: isNotificationOpen`).

4. **`['menu-pending-counts']`** qua hook `useMenuPendingCountsQuery()`:
   - Endpoint: `GET /api/dashboard/pending-counts`
   - Mục đích: Cung cấp số lượng việc cần xử lý cho từng badge trên menu (ví dụ: `leaveRequestsPending: 3`).
   - Cấu hình: `staleTime: 60 * 1000`.

### 2.3. State toàn cục (Global Client State - `Zustand`)

Chỉ quản lý trạng thái giao diện UI mang tính xuyên suốt giữa nhiều component trong layout:

- **`useLayoutStore`**:
  - `isSidebarCollapsed` (`boolean`): Trạng thái co/giãn sidebar trên desktop.
  - `isMobileDrawerOpen` (`boolean`): Trạng thái mở/đóng drawer điều hướng trên mobile.
  - `toggleSidebarCollapse()`: Đổi trạng thái thu gọn và lưu vào `localStorage` (`hrm_sidebar_collapsed`).
  - `setSidebarCollapse(value: boolean)`: Gán trực tiếp trạng thái co/giãn.
  - `toggleMobileDrawer()`: Bật/tắt drawer mobile.
  - `setMobileDrawer(open: boolean)`: Đóng/mở drawer mobile.

### 2.4. Trạng thái tham số URL (URL Query Parameters)

- **Tìm kiếm toàn cục (`GlobalSearchBar`)**: Khi người dùng nhấn Enter, điều hướng tới trang kết quả tìm kiếm với query param:
  `navigate('/search?q=' + encodeURIComponent(keyword))` hoặc nếu người dùng đang ở module cụ thể thì điều hướng kèm param lọc (ví dụ: `/employees?search=...`).
- **Liên kết từ thông báo**: Khi click vào một thông báo chưa đọc (ví dụ đơn xin nghỉ phép số #123), hệ thống điều hướng sâu qua query param `/leave-requests?id=123` để tự động mở đúng modal/chi tiết đơn.
- Không đưa trạng thái đóng/mở popover hay dropdown vào URL query parameters nhằm tránh gây rối loạn lịch sử điều hướng của trình duyệt.

---

## 3. Cấu trúc dữ liệu & TypeScript Interfaces

Tuân thủ nghiêm ngặt chuẩn `frontend-standards.md`, **tuyệt đối không sử dụng kiểu `any`**.

### 3.1. Kiểu dữ liệu miền nghiệp vụ (Domain Types)

```typescript
import type { ComponentType, ReactNode } from "react";

/**
 * Danh sách vai trò người dùng trong hệ thống HRM
 */
export type UserRole = "ADMIN" | "HR" | "MANAGER" | "EMPLOYEE";

/**
 * Thông tin người dùng đăng nhập hiện tại
 */
export interface CurrentUser {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
  readonly avatarUrl?: string | null;
  readonly roles: readonly UserRole[];
}

/**
 * Cấu hình một mục trên menu Sidebar
 */
export interface NavItemConfig {
  readonly id: string;
  readonly label: string;
  readonly path: string;
  readonly icon: ComponentType<{ readonly className?: string }>;
  readonly requiredRoles?: readonly UserRole[];
  readonly pendingCountKey?: "leaveRequests" | "attendanceExceptions" | "onboardingTasks";
}

/**
 * Loại sự kiện thông báo
 */
export type NotificationType = "LEAVE" | "ATTENDANCE" | "PAYROLL" | "SYSTEM";

/**
 * Cấu trúc thông báo hiển thị trong Dropdown
 */
export interface NotificationItemData {
  readonly id: string;
  readonly type: NotificationType;
  readonly title: string;
  readonly description: string;
  readonly createdAt: string;
  readonly isRead: boolean;
  readonly targetUrl?: string;
}

/**
 * Cấu trúc tin nhắn hội thoại với trợ lý AI
 */
export interface AIMessage {
  readonly id: string;
  readonly sender: "user" | "assistant";
  readonly content: string;
  readonly timestamp: string;
}
```

### 3.2. Cấu trúc Props cho các Dumb Components cốt lõi

```typescript
/**
 * Props cho SidebarLogo (Shared UI)
 */
export interface SidebarLogoProps {
  readonly isCollapsed: boolean;
  readonly systemName?: string;
  readonly shortName?: string;
  readonly description?: string;
  readonly onLogoClick?: () => void;
}

/**
 * Props cho SidebarNavItem
 */
export interface SidebarNavItemProps {
  readonly item: NavItemConfig;
  readonly isActive: boolean;
  readonly isCollapsed: boolean;
  readonly pendingCount?: number;
  readonly onNavigate: (path: string) => void;
}

/**
 * Props cho SidebarNavList
 */
export interface SidebarNavListProps {
  readonly navItems: readonly NavItemConfig[];
  readonly currentPath: string;
  readonly isCollapsed: boolean;
  readonly pendingCounts?: Readonly<Record<string, number>>;
  readonly onNavigate: (path: string) => void;
}

/**
 * Props cho NavPendingBadge (Shared UI)
 */
export interface NavPendingBadgeProps {
  readonly count: number;
  readonly className?: string;
}

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
 * Props cho SidebarUserProfile
 */
export interface SidebarUserProfileProps {
  readonly user: CurrentUser;
  readonly isCollapsed: boolean;
  readonly onProfileClick?: () => void;
}

/**
 * Props cho HamburgerButton (Shared UI)
 */
export interface HamburgerButtonProps {
  readonly onClick: () => void;
  readonly isCollapsed?: boolean;
  readonly ariaLabel?: string;
  readonly className?: string;
}

/**
 * Props cho SearchInput (Shared UI)
 */
export interface SearchInputProps {
  readonly value: string;
  readonly placeholder?: string;
  readonly onChange: (value: string) => void;
  readonly onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  readonly onClear?: () => void;
  readonly className?: string;
}

/**
 * Props cho BreadcrumbNavigation (Shared UI)
 */
export interface BreadcrumbItem {
  readonly label: string;
  readonly path?: string;
}

export interface BreadcrumbNavigationProps {
  readonly items: readonly BreadcrumbItem[];
  readonly onNavigate?: (path: string) => void;
}

/**
 * Props cho NotificationTriggerBtn (Shared UI)
 */
export interface NotificationTriggerBtnProps {
  readonly unreadCount: number;
  readonly isOpen: boolean;
  readonly onClick: () => void;
}

/**
 * Props cho NotificationItem
 */
export interface NotificationItemProps {
  readonly notification: NotificationItemData;
  readonly onClick: (notification: NotificationItemData) => void;
}

/**
 * Props cho NotificationDropdownList
 */
export interface NotificationDropdownListProps {
  readonly notifications: readonly NotificationItemData[];
  readonly isLoading: boolean;
  readonly onNotificationClick: (notification: NotificationItemData) => void;
  readonly onMarkAllAsRead: () => void;
  readonly onViewAll: () => void;
  readonly onClose: () => void;
}

/**
 * Props cho CurrentDateDisplay (Shared UI)
 */
export interface CurrentDateDisplayProps {
  readonly date?: Date;
  readonly locale?: string;
  readonly className?: string;
}

/**
 * Props cho AIAssistantTriggerButton (Shared UI)
 */
export interface AIAssistantTriggerButtonProps {
  readonly isOpen: boolean;
  readonly onClick: () => void;
  readonly className?: string;
}

/**
 * Props cho AIAssistantChatDrawer
 */
export interface AIAssistantChatDrawerProps {
  readonly isOpen: boolean;
  readonly messages: readonly AIMessage[];
  readonly isThinking: boolean;
  readonly inputValue: string;
  readonly onInputChange: (value: string) => void;
  readonly onSendMessage: (content: string) => void;
  readonly onClose: () => void;
}

/**
 * Props cho MainContentArea
 */
export interface MainContentAreaProps {
  readonly isSidebarCollapsed: boolean;
  readonly children: ReactNode;
}
```

### 3.3. Đặc tả Zustand Store Interface

```typescript
export interface LayoutStoreState {
  readonly isSidebarCollapsed: boolean;
  readonly isMobileDrawerOpen: boolean;
  readonly toggleSidebarCollapse: () => void;
  readonly setSidebarCollapse: (collapsed: boolean) => void;
  readonly toggleMobileDrawer: () => void;
  readonly setMobileDrawer: (open: boolean) => void;
}
```
