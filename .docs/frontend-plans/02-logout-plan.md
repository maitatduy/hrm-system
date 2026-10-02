# Bản quy hoạch kỹ thuật Frontend: Hành động Đăng xuất (Logout)

Tài liệu quy hoạch kỹ thuật cho hành động Đăng xuất (`LogoutAction`) của hệ thống HRM System, tích hợp các ràng buộc từ `.docs/ideas/02-logout-idea.md`, `.docs/DESIGN.md`, `.agent/rules/frontend-standards.md`, và `.docs/ARCHITECTURE.md`.

---

## 1. Phân rã component

Hành động đăng xuất không phải là một trang độc lập (`page`) mà là một tương tác hành vi (action flow) được kích hoạt từ menu người dùng trên Header của `MasterLayout`, hiển thị modal xác nhận và điều hướng về trang đăng nhập.

### 1.1. Sơ đồ cây phân cấp component (Component Hierarchy)

```
UserProfileContainer [SMART]
├── UserProfileDropdown [DUMB] [SHARED UI]
│   ├── DropdownTrigger [DUMB] [SHARED UI]
│   └── DropdownMenu [DUMB] [SHARED UI]
│       ├── DropdownMenuItem [DUMB] [SHARED UI] (Hồ sơ cá nhân)
│       ├── DropdownMenuItem [DUMB] [SHARED UI] (Đổi mật khẩu)
│       ├── DropdownDivider [DUMB] [SHARED UI]
│       └── DropdownMenuItemLogout [DUMB] (Kích hoạt mở modal)
└── LogoutDialogContainer [SMART]
    └── ConfirmDialog [DUMB] [SHARED UI]
        ├── DialogOverlay [DUMB] [SHARED UI]
        └── DialogContent [DUMB] [SHARED UI]
            ├── DialogHeader [DUMB] [SHARED UI]
            │   ├── DangerAlertIconBadge [DUMB] [SHARED UI]
            │   ├── DialogTitle [DUMB] [SHARED UI]
            │   └── DialogDescription [DUMB] [SHARED UI]
            └── DialogFooter [DUMB] [SHARED UI]
                ├── SecondaryButton [DUMB] [SHARED UI] (Nút "Hủy")
                └── DangerButton [DUMB] [SHARED UI] (Nút "Đăng xuất")
```

### 1.2. Danh sách và phân loại chi tiết component

| Component                  | Phân loại | Khả năng tái sử dụng (Shared UI) | Trách nhiệm kỹ thuật & Ràng buộc Design Token                                                                                                                                                                                                                          |
| :------------------------- | :-------- | :------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `UserProfileContainer`     | `[SMART]` | Không                            | Quản lý state mở/đóng của `UserProfileDropdown` và `LogoutDialogContainer`; lắng nghe sự kiện bấm vào mục Đăng xuất để mở modal xác nhận.                                                                                                                           |
| `UserProfileDropdown`      | `[DUMB]`  | Có (`[SHARED UI]`)               | Menu popover nổi chứa các liên kết tiện ích của tài khoản, nền surface `#ffffff`, bo góc `rounded-md` (8px), bóng mờ nhẹ, viền hairline `#e6e6e6`.                                                                                                                   |
| `DropdownMenuItemLogout`   | `[DUMB]`  | Không                            | Mục "Đăng xuất" trong dropdown menu, chữ màu `accent-danger` (`#dc2626`) hoặc có icon cảnh báo nhẹ, padding chuẩn `spacing-sm` (12px), kích hoạt callback `onOpenLogoutModal()`.                                                                                       |
| `LogoutDialogContainer`    | `[SMART]` | Không                            | Container điều phối logic xác nhận đăng xuất: gọi custom hook mutation `useLogoutMutation`, kích hoạt dọn dẹp state client/global (`clearAuth`), dọn cache TanStack Query (`queryClient.clear()`), đóng dialog và điều hướng người dùng về `/login`.                |
| `ConfirmDialog`            | `[DUMB]`  | Có (`[SHARED UI]`)               | Primitive component dựng hộp thoại xác nhận modal nhỏ, căn giữa màn hình (`fixed inset-0 flex items-center justify-center z-50`). Dùng chung cho toàn dự án khi cần xác nhận hành động nguy hiểm (xóa nhân viên, hủy kỳ lương, đăng xuất).                        |
| `DialogOverlay`            | `[DUMB]`  | Có (`[SHARED UI]`)               | Lớp phủ nền mờ (backdrop) phía sau modal, chặn tương tác với trang chính, nền đen trong suốt `bg-black/40` hoặc `backdrop-blur-xs`.                                                                                                                                  |
| `DialogContent`            | `[DUMB]`  | Có (`[SHARED UI]`)               | Khối hộp thoại trung tâm, nền surface `#ffffff`, viền hairline `#e6e6e6`, bo góc **`rounded-lg` (12px)**, padding trong **`spacing-lg` (24px)**, chiều rộng tối đa gọn gàng `max-w-md w-full`. Hiệu ứng xuất hiện êm ái (fade-in & zoom nhẹ 98% -> 100%).          |
| `DialogHeader`             | `[DUMB]`  | Có (`[SHARED UI]`)               | Bố cục phần đầu modal gồm icon cảnh báo, tiêu đề chính và đoạn giải thích phụ.                                                                                                                                                                                         |
| `DangerAlertIconBadge`     | `[DUMB]`  | Có (`[SHARED UI]`)               | Badge tròn nhỏ kích thước 40x40px bo tròn `rounded-full`, nền màu đỏ nhạt 10% của `accent-danger` (`#dc2626`), chứa icon biểu tượng cảnh báo/đăng xuất màu `#dc2626`.                                                                                                 |
| `DialogTitle`              | `[DUMB]`  | Có (`[SHARED UI]`)               | Tiêu đề modal: "Xác nhận đăng xuất", font `heading-3` (22px, đậm 700), màu chữ `ink` (`#000000`).                                                                                                                                                                      |
| `DialogDescription`        | `[DUMB]`  | Có (`[SHARED UI]`)               | Đoạn mô tả cảnh báo ngắn: "Bạn có chắc chắn muốn kết thúc phiên làm việc hiện tại?", font `body-md` (16px, 400), màu chữ `ink-muted` (`#615d59`).                                                                                                                     |
| `DialogFooter`             | `[DUMB]`  | Có (`[SHARED UI]`)               | Thanh chứa 2 nút hành động ở chân modal, căn lề phải (`flex justify-end gap-3`), khoảng cách trên `spacing-md` (16px).                                                                                                                                               |
| `SecondaryButton`          | `[DUMB]`  | Có (`[SHARED UI]`)               | Nút "Hủy": nền surface `#ffffff`, chữ đen `ink` (`#000000`), viền hairline `#e6e6e6`, bo góc **`rounded-md` (8px)**, hover nền `canvas-soft` (`#f6f5f4`). Tắt tương tác khi mutation đang chạy (`disabled={isLoading}`).                                            |
| `DangerButton`             | `[DUMB]`  | Có (`[SHARED UI]`)               | Nút "Đăng xuất": hành động nguy hiểm/kết thúc phiên, màu nền **`accent-danger` (`#dc2626`)**, hover/pressed `#b91c1c`, chữ trắng, bo góc **`rounded-md` (8px)** đồng nhất với nút hủy. Hỗ trợ hiển thị spinner khi đang gọi API hủy token (`isLoading`).            |

---

## 2. Quản lý trạng thái (State Management)

Hệ thống trạng thái cho hành động Đăng xuất được phân tách chuẩn hóa theo 3 tầng và quy định xử lý URL:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TẦNG QUẢN LÝ TRẠNG THÁI                         │
├─────────────────────┬──────────────────────┬───────────────────────────┤
│ 1. LOCAL STATE      │ 2. SERVER STATE      │ 3. GLOBAL STATE           │
│ (useState)          │ (TanStack Query)     │ (Zustand Store)           │
├─────────────────────┼──────────────────────┼───────────────────────────┤
│ - isModalOpen       │ - useLogoutMutation  │ - useAuthStore            │
│ - isDropdownOpen    │   (POST /auth/logout)│   .clearAuth()            │
│                     │ - isPending status   │ - queryClient.clear()     │
│                     │ - error (resilient)  │   (xóa sạch in-memory)    │
└─────────────────────┴──────────────────────┴───────────────────────────┘
```

### 2.1. State cục bộ (Local State - `useState`)

Quản lý trạng thái đóng/mở giao diện trực tiếp tại client:

- **`isModalOpen` (`boolean`)**:
  - Quản lý qua `useState(false)` tại `UserProfileContainer`.
  - `true`: Hiển thị `LogoutDialogContainer` (Confirm Dialog).
  - `false`: Đóng modal, trả lại quyền tương tác trang.
- **`isDropdownOpen` (`boolean`)**:
  - Quản lý qua `useState(false)` cho menu tài khoản người dùng ở Header.
  - Khi người dùng click chọn "Đăng xuất", tự động set `isDropdownOpen(false)` đồng thời bật `isModalOpen(true)` để menu không bị lơ lửng dưới modal.

### 2.2. State máy chủ (Server State - `TanStack Query`)

Đăng xuất là thao tác ghi nhận phía máy chủ để vô hiệu hóa token trên Redis:

- **`useLogoutMutation()`**:
  - Endpoint: `POST /api/v1/auth/logout` (thông qua axios instance tập trung tại `lib/axios`).
  - Headers: Tự động đính kèm `Authorization: Bearer <accessToken>` qua Axios Request Interceptor.
  - Payload: `{}` (Rỗng hoặc gửi kèm refreshToken nếu hệ thống yêu cầu xác định phiên cụ thể).
  - Trạng thái phản hồi:
    - `isPending`: Bật trạng thái quay spinner trên `DangerButton`, khóa nút `SecondaryButton` (`disabled`) để chống người dùng ấn nhiều lần hoặc hủy giữa chừng khi request mạng đang được gửi.
    - `isError`: Bắt lỗi khi server phản hồi timeout hoặc mạng đứt.
- **Cơ chế Dọn dẹp Bộ đệm Triệt để (Cache Invalidation & Memory Eviction)**:
  - Khi đăng xuất, **không chỉ invalidate từng query** mà gọi trực tiếp:
    ```typescript
    queryClient.clear();
    ```
  - **Mục đích tối ưu bảo mật**: Xóa toàn bộ dữ liệu nhạy cảm đang cache trong bộ nhớ (danh sách nhân viên, thông tin tài chính cá nhân, phiếu lương, danh sách nghỉ phép) nhằm ngăn chặn rò rỉ dữ liệu giữa 2 người dùng khác nhau trên cùng một máy tính.
- **Chiến lược Phục hồi Thất bại (Resilient Cleanup Pattern)**:
  - Quá trình dọn dẹp state client và điều hướng về trang Login được đặt trong callback `onSettled` (chạy cả khi API thành công lẫn thất bại 500 / Network Error).
  - **Lý do kiến trúc**: Người dùng có chủ đích thoát khỏi máy. Dù mạng gặp sự cố không báo được lên Redis, client vẫn PHẢI bắt buộc hủy token trong local storage, xóa session Zustand và đá người dùng ra màn hình đăng nhập ngay lập tức.

### 2.3. State toàn cục (Global Client State - `Zustand`)

Thực hiện dọn dẹp sạch sẽ phiên đăng nhập trên toàn bộ ứng dụng:

- **`useAuthStore.getState().clearAuth()`**:
  - Gán `accessToken: null`.
  - Gán `isAuthenticated: false`.
  - Gán `sessionUser: null`.
  - Xóa token lưu trữ trong bộ nhớ trình duyệt: `localStorage.removeItem("auth_access_token")`.
- **Đồng bộ Axios Interceptor**: Ngay sau khi `clearAuth()` được gọi, các request bất đồng bộ còn sót lại (nếu có) sẽ bị chặn ngay tại client interceptor vì không còn access token hợp lệ.

### 2.4. Trạng thái tham số URL (URL Search Parameters)

- **Modal xác nhận đăng xuất**: **TUYỆT ĐỐI KHÔNG** đẩy trạng thái mở modal lên URL (như `?logout=true`).
  - *Lý do*: Tránh trường hợp người dùng copy URL gửi đồng nghiệp dẫn đến hiện modal đăng xuất; tránh việc nhấn nút Back/Forward của trình duyệt kích hoạt lại trạng thái xác nhận.
- **Sau khi đăng xuất thành công**:
  - Điều hướng người dùng về trang đăng nhập sạch: `navigate('/login', { replace: true })`.
  - `replace: true` là bắt buộc để thay thế lịch sử trang trước đó, ngăn người dùng bấm nút "Back" trên trình duyệt để quay lại trang nội bộ vừa đăng xuất.
  - Tuỳ chọn ngữ cảnh: Có thể bổ sung query parameter `/login?reason=logged_out` để trang `LoginPage` hiển thị một toast thông báo màu xanh `accent-green`: _"Bạn đã đăng xuất thành công khỏi hệ thống."_

---

## 3. Cấu trúc dữ liệu & TypeScript Interfaces

Tuân thủ nghiêm ngặt chuẩn `frontend-standards.md`, **tuyệt đối không sử dụng kiểu `any`**.

### 3.1. DTO & Kiểu dữ liệu xác thực cho Logout API

```typescript
/**
 * DTO gửi lên API Gateway POST /api/v1/auth/logout
 */
export interface LogoutRequest {
  readonly refreshToken?: string;
}

/**
 * Phản hồi thành công từ API Gateway khi vô hiệu hóa token
 */
export interface LogoutResponse {
  readonly success: boolean;
  readonly message: string;
}
```

### 3.2. Cấu trúc Props cho các Dumb Components cốt lõi

```typescript
import type { ReactNode } from "react";

/**
 * Props cho ConfirmDialog (Shared UI Primitive)
 */
export interface ConfirmDialogProps {
  readonly isOpen: boolean;
  readonly title: string;
  readonly description: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly isLoading?: boolean;
  readonly variant?: "danger" | "primary";
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

/**
 * Props cho DialogOverlay (Shared UI)
 */
export interface DialogOverlayProps {
  readonly isOpen: boolean;
  readonly onClick?: () => void;
}

/**
 * Props cho DialogContent (Shared UI)
 * Bo góc: rounded-lg (12px), đệm spacing-lg (24px)
 */
export interface DialogContentProps {
  readonly children: ReactNode;
  readonly className?: string;
}

/**
 * Props cho DangerButton (Shared UI)
 * Nút hành động nguy hiểm: nền accent-danger #dc2626, hover #b91c1c, bo góc rounded-md (8px)
 */
export interface DangerButtonProps {
  readonly children: ReactNode;
  readonly onClick: () => void;
  readonly isLoading?: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
}

/**
 * Props cho SecondaryButton (Shared UI)
 * Nút hủy: nền trắng #ffffff, viền hairline #e6e6e6, bo góc rounded-md (8px)
 */
export interface SecondaryButtonProps {
  readonly children: ReactNode;
  readonly onClick: () => void;
  readonly disabled?: boolean;
  readonly className?: string;
}

/**
 * Props cho DangerAlertIconBadge (Shared UI)
 */
export interface DangerAlertIconBadgeProps {
  readonly className?: string;
}
```

### 3.3. Đặc tả Custom Hook `useLogoutMutation` & Cache Invalidation

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { logoutApi } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/store";

export const useLogoutMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: () => logoutApi(),
    onSettled: () => {
      // 1. Dọn sạch phiên đăng nhập trong Zustand và LocalStorage
      clearAuth();

      // 2. Xóa toàn bộ bộ nhớ cache TanStack Query để tránh lộ dữ liệu
      queryClient.clear();

      // 3. Đóng modal nếu có callback
      onSuccessCallback?.();

      // 4. Điều hướng về trang đăng nhập và thay thế URL history
      navigate("/login?reason=logged_out", { replace: true });
    },
  });
};
```

---

## 4. Kế hoạch triển khai & Kịch bản kiểm thử (Implementation & Testing Checklist)

1. **Khởi tạo Shared UI Primitives**:
   - `ConfirmDialog`: Dựng modal xác nhận hành vi dùng chung theo chuẩn thiết kế `DESIGN.md`.
   - `DangerButton`: Nền `accent-danger` (`#dc2626`), active `#b91c1c`, chữ trắng, bo góc **`rounded-md` (8px)**, tích hợp hiệu ứng spinner khi tải.
   - `SecondaryButton`: Nền surface trắng `#ffffff`, viền hairline `#e6e6e6`, bo góc **`rounded-md` (8px)**, font `body-sm`.
2. **Xây dựng API Layer & Custom Hook**:
   - Khai báo hàm `logoutApi` gọi `POST /api/v1/auth/logout` qua `apiClient`.
   - Xây dựng custom hook `useLogoutMutation` sử dụng TanStack Query, bọc logic dọn dẹp an toàn trong `onSettled`.
3. **Tích hợp vào Header & User Profile**:
   - Bổ sung nút "Đăng xuất" vào `UserProfileDropdown` trong Header của Master Layout.
   - Khi bấm, kích hoạt mở `ConfirmDialog`.
4. **Kiểm thử tự động & Trải nghiệm (Unit & Integration Tests)**:
   - **Modal Interactivity Test**: Kiểm tra bấm "Hủy" đóng modal và giữ nguyên phiên đăng nhập; bấm bên ngoài backdrop (overlay) đóng modal an toàn.
   - **Double-Submit Prevention Test**: Kiểm tra khi đang gọi API (`isLoading = true`), cả nút "Đăng xuất" và nút "Hủy" đều bị vô hiệu hóa (`disabled = true`) để ngăn chặn double-click.
   - **Resilient Cleanup Test**: Giả lập API backend phản hồi lỗi 500 hoặc rớt mạng. Xác minh rằng Zustand store vẫn chạy `clearAuth()`, `queryClient.clear()` vẫn được gọi và trình duyệt vẫn điều hướng về `/login`.
   - **History Replace Test**: Kiểm tra sau khi đăng xuất, bấm nút Back của trình duyệt không quay trở lại được trang Dashboard có dữ liệu.
