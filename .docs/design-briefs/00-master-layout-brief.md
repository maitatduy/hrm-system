# Đặc tả thiết kế giao diện (Design Brief): Master Layout

Tài liệu đặc tả kỹ thuật hình ảnh dành cho AI UI generator / Design engine. Tuân thủ tuyệt đối quy chuẩn tại `.docs/ideas/00-master-layout-idea.md`, `.docs/frontend-plans/00-master-layout-plan.md` và `.docs/DESIGN.md`.

---

## 1. Hệ thống lưới và bố cục (Grid & Layout System)

### 1.1. Cấu trúc khung gốc (Root Frame)

- **Viewport tổng thể**: `min-h-screen w-full flex flex-col bg-[#f6f5f4]` (token `canvas-soft`).
- **Breakpoints**:
  - `Desktop` ($\ge$ 1024px): Bố cục chia 2 phân vùng (Sidebar cố định bên trái + Main content dạt phải).
  - `Mobile / Tablet` (< 1024px): Bố cục 1 cột dọc duy nhất (`flex-col`), Sidebar ẩn trong Drawer trượt từ cạnh trái.

### 1.2. Phân vùng lưới Desktop ($\ge$ 1024px)

- **Header**:
  - Vị trí: `fixed top-0 left-0 right-0 z-40 h-16` (64px).
  - Layout: `flex items-center justify-between px-6 bg-[#ffffff]` (token `surface`), viền đáy `border-b border-[#e6e6e6]` (token `hairline`).
- **Sidebar**:
  - Vị trí: `fixed top-0 left-0 bottom-0 z-30 pt-16 bg-[#ffffff]` (token `surface`).
  - Chiều rộng:
    - Trạng thái mở rộng (`expanded`): `w-64` (256px).
    - Trạng thái thu gọn (`collapsed`): `w-20` (80px).
  - Viền phân cách: `border-r border-[#e6e6e6]` (token `hairline`).
  - Layout trong: `flex flex-col justify-between h-full py-4`.
- **Main Content Area**:
  - Vị trí: `mt-16` (bù trừ header), `flex-1 min-w-0 bg-[#f6f5f4]` (token `canvas-soft`).
  - Dịch lề trái (`margin-left`):
    - Khi Sidebar mở: `ml-64`.
    - Khi Sidebar thu gọn: `ml-20`.
  - Padding: `p-6` (token `spacing-lg`: 24px) nhất quán trên toàn bộ bề mặt làm việc.
  - Chiều cao tối thiểu: `min-h-[calc(100vh-4rem)]`.
- **Footer**:
  - Vị trí: Đặt ở đáy `MainContentArea`, layout `flex items-center justify-between py-4 px-6 border-t border-[#e6e6e6] bg-[#ffffff]`.

### 1.3. Phân vùng lưới Mobile / Tablet (< 1024px)

- **Header**: `fixed top-0 left-0 right-0 z-40 h-16 px-4 flex items-center justify-between bg-[#ffffff] border-b border-[#e6e6e6]`.
- **Sidebar**: Chuyển thành `MobileSidebarDrawer` (`fixed inset-0 z-50`), chiều rộng panel `w-72 max-w-[80vw] bg-[#ffffff]`.
- **Main Content Area**: `mt-16 ml-0 w-full p-4 bg-[#f6f5f4]`.
- **Footer**: `w-full py-4 px-4 flex flex-col gap-2 items-center text-center bg-[#ffffff] border-t border-[#e6e6e6]`.

### 1.4. Bảng quy đổi Spacing áp dụng

- `spacing-xs`: `4px` (`gap-1`, `p-1`) - Giãn cách các icon nhỏ, badge offset.
- `spacing-sm`: `8px` (`gap-2`, `p-2`) - Khoảng cách item trong menu list, padding nút bấm.
- `spacing-md`: `16px` (`gap-4`, `p-4`) - Khoảng cách giữa các khối trong header, padding dropdown/popover.
- `spacing-lg`: `24px` (`gap-6`, `p-6`) - Padding chính của Main Content, padding trong card lớn.

---

## 2. Đặc tả chi tiết Dumb Component

> Chỉ quy định các component được gắn nhãn `[DUMB]` từ `.docs/frontend-plans/00-master-layout-plan.md`. Bỏ qua toàn bộ component `[SMART]`.

### 2.1. `MobileNavToggle` [SHARED UI]

- **Box style**: Kích thước `40x40px`, nền trong suốt `bg-transparent`, bo góc `rounded-md` (8px). Không viền, không đổ bóng.
- **Icon**: Hamburger / Menu icon (24x24px), màu nét vẽ `#000000` (`ink`).
- **Trạng thái**:
  - _Hover_: Nền chuyển `bg-[#f6f5f4]` (`canvas-soft`).
  - _Active_: Scale nhẹ `scale-95`.
  - _Display_: Chỉ hiển thị trên viewport < 1024px (`lg:hidden`).

### 2.2. `AppLogo` [SHARED UI]

- **Box style**: Khối ngang `flex items-center gap-2 h-10 px-2 cursor-pointer`.
- **Icon biểu tượng**: Biểu tượng HRM hình khiên/hình học cách điệu, màu `#0075de` (`primary`), kích thước `32x32px`.
- **Typography**: Chữ thương hiệu "HRM SYSTEM", font `heading-3` (22px, đậm 700), màu `#000000` (`ink`), khoảng cách ký tự `tracking-tight`.

### 2.3. `HeaderActions`

- **Box style**: Khối `flex items-center gap-4` (`spacing-md`).
- **Typography**: Không chứa văn bản trực tiếp, hoạt động như container canh phải header.

### 2.4. `NotificationIconBtn` [SHARED UI]

- **Box style**: Vòng tròn `40x40px`, `rounded-full`, viền hairline `border border-[#e6e6e6]`, nền `#ffffff` (`surface`).
- **Icon**: Bell icon `20x20px`, màu `#31302e` (`ink-secondary`).
- **Trạng thái**:
  - _Hover_: Nền `bg-[#f6f5f4]` (`canvas-soft`), icon chuyển sang `#000000` (`ink`).
  - _Active_: `border-[#0075de]`.

### 2.5. `NotificationBadge` [SHARED UI]

- **Box style**: Dạng viên thuốc `rounded-full`, vị trí góc trên phải icon chuông (`absolute -top-1 -right-1`), chiều cao tối thiểu `18px`, `px-1.5`, viền trắng cách ly `border-2 border-[#ffffff]`.
- **Màu nền**: `#dd5b00` (`accent-orange`) cho thông báo thường; `#dc2626` (`accent-danger`) nếu có cảnh báo khẩn.
- **Typography**: Chữ trắng `#ffffff`, font `caption` (12px, đậm 700), căn giữa tuyệt đối.

### 2.6. `NotificationQuickPopover`

- **Box style**: Khung nổi `w-80 md:w-96 bg-[#ffffff]` (`surface`), bo góc `rounded-lg` (12px), viền hairline `border border-[#e6e6e6]`, đổ bóng đa lớp mờ `shadow-lg` (ambient blur 16px, opacity 6%).
- **Header popover**: `p-4 border-b border-[#e6e6e6] flex justify-between items-center`, tiêu đề font `heading-3` (cỡ nhỏ 16px, đậm 700, màu `ink`).
- **Notification Item**:
  - Layout: `p-3 flex gap-3 items-start border-b border-[#e6e6e6] last:border-b-0 cursor-pointer`.
  - Item chưa đọc: Nền `bg-[#f6f5f4]` (`canvas-soft`), chấm chỉ báo chưa đọc màu `#0075de` (`primary`) kích thước `6x6px` `rounded-full`.
  - Item đã đọc: Nền `#ffffff`.
  - Typography: Tiêu đề mục font `body-sm` (14px, đậm 600, màu `ink`), thời gian font `caption` (12px, màu `ink-muted` `#615d59`).
  - _Hover_: Nền đổi sang `bg-[#eff4ff]` (mờ nhẹ theo primary) hoặc `bg-[#f6f5f4]`.

### 2.7. `UserAvatar` [SHARED UI]

- **Box style**: Khối vuông bo tròn hoàn toàn `rounded-full`, kích thước tiêu chuẩn `36x36px` (header) hoặc `40x40px` (profile), viền hairline `border border-[#e6e6e6]`, nền `#ffffff`.
- **Ảnh đại diện**: `object-cover w-full h-full rounded-full`.
- **Fallback (khi không có ảnh)**: Nền `#f6f5f4`, chữ viết tắt họ tên 2 ký tự in hoa, typography `caption` (12px, đậm 700, màu `ink-secondary` `#31302e`).

### 2.8. `UserInfoDisplay`

- **Box style**: Cột dọc `flex flex-col items-start justify-center leading-tight hidden sm:flex`.
- **Họ và tên**: Typography `body-md` (14-16px, trọng số 400), màu `#000000` (`ink`), không dùng font đậm theo quy tắc DESIGN.md.
- **Chức vụ / Vai trò**: Typography `caption` (12px, trọng số 400), màu `#615d59` (`ink-muted`).

### 2.9. `UserProfileDropdown` [SHARED UI]

- **Box style**: Khung menu `w-56 bg-[#ffffff]` (`surface`), bo góc `rounded-md` (8px), viền hairline `border border-[#e6e6e6]`, đổ bóng nhẹ `shadow-md`, padding `p-1`.
- **Dropdown Item**:
  - Layout: `flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors`.
  - Typography: Font `body-sm` (14px, trọng số 400), màu `#000000` (`ink`).
  - _Hover_: Nền chuyển `bg-[#f6f5f4]` (`canvas-soft`).
  - _Danger Item (Đăng xuất)_: Chữ màu `#dc2626` (`accent-danger`), icon đỏ, hover nền `#fee2e2`.
- **Divider**: Đường kẻ ngang `h-[1px] bg-[#e6e6e6] my-1`.

### 2.10. `DesktopSidebar`

- **Box style**: Khung cố định dọc, nền `#ffffff` (`surface`), viền phải `border-r border-[#e6e6e6]` (`hairline`). Chiều rộng `w-64` (mở rộng) hoặc `w-20` (thu gọn). Không đổ bóng.
- **Transition**: `transition-all duration-200 ease-in-out`.

### 2.11. `SidebarHeader`

- **Box style**: Chiều cao `h-16 flex items-center px-6 border-b border-[#e6e6e6]`. Dùng để hiển thị logo khi Sidebar bao trọn chiều cao màn hình.

### 2.12. `SidebarNavList`

- **Box style**: Danh sách cuộn dọc `flex flex-col gap-1 py-4 px-3 overflow-y-auto`.

### 2.13. `SidebarNavItem`

- **Box style**: Khối ngang `flex items-center gap-3 h-11 px-3 rounded-none relative cursor-pointer select-none`.
- **Ràng buộc DESIGN.md tuyệt đối**:
  - **Trạng thái Active**:
    - **Thanh chỉ báo bên trái**: Xuất hiện vạch dọc dính sát cạnh trái màu `#0075de` (`primary`), độ rộng `w-1` (4px), chiều cao `h-full` (`absolute left-0 top-0 bottom-0`).
    - **Nền**: Giữ nguyên nền trắng `#ffffff`. **CẤM ĐỔI MÀU NỀN TOÀN BỘ HÀNG**.
    - **Chữ & Icon**: Chuyển màu sang `#0075de` (`primary`) hoặc giữ `#000000` (`ink`). Typography `body-sm` (14px, đậm 600).
  - **Trạng thái Inactive**:
    - Nền trong suốt / trắng `#ffffff`.
    - Màu chữ & Icon: `#31302e` (`ink-secondary`). Typography `body-sm` (14px, đậm 400). Không có vạch chỉ báo.
  - **Trạng thái Hover**:
    - Nền đổi nhẹ sang `#f6f5f4` (`canvas-soft`). Màu chữ chuyển về `#000000` (`ink`).
  - **Dạng thu gọn (Collapsed)**:
    - Ẩn nhãn chữ, chỉ hiển thị icon căn giữa `justify-center`, tooltip hiển thị khi hover.

### 2.14. `SidebarCollapseToggle` [SHARED UI]

- **Box style**: Nút bấm `w-full h-10 flex items-center justify-center gap-2 rounded-md border border-[#e6e6e6] bg-[#ffffff]`.
- **Icon**: Chevron mũi tên trái/phải (`16x16px`), màu `#615d59` (`ink-muted`).
- **Trạng thái**: Hover nền `bg-[#f6f5f4]`, icon chuyển sang `#000000`.

### 2.15. `MobileSidebarDrawer` [SHARED UI]

- **Box style**:
  - Lớp phủ mờ (Backdrop): `fixed inset-0 bg-black/40 z-50 backdrop-blur-sm`.
  - Khung nội dung (Panel): `fixed top-0 left-0 bottom-0 w-72 max-w-[80vw] bg-[#ffffff] z-50 shadow-2xl flex flex-col`. Bo góc mép ngoài `rounded-r-lg` (12px).

### 2.16. `DrawerHeader`

- **Box style**: `h-16 px-4 flex items-center justify-between border-b border-[#e6e6e6] bg-[#ffffff]`.
- **Nút đóng (Close button)**: `p-2 rounded-md hover:bg-[#f6f5f4] text-[#31302e]`.

### 2.17. `MainContentArea`

- **Box style**: Khung chứa nội dung chính, nền `#f6f5f4` (`canvas-soft`), padding chuẩn `p-6` (`spacing-lg`), hỗ trợ responsive co giãn mượt theo trạng thái sidebar.

### 2.18. `AppFooter`

- **Box style**: Khung chân trang `w-full py-4 px-6 border-t border-[#e6e6e6] bg-[#ffffff] flex flex-row justify-between items-center`.
- **Typography**: Font `caption` (12px, trọng số 400), màu `#a39e98` (`ink-faint`).
- **Liên kết phụ**: Màu `#615d59` (`ink-muted`), hover gạch chân nhẹ.

---

## 3. Ràng buộc màu sắc (Color Palette Mapping)

Áp dụng bảng màu duy nhất định nghĩa tại `.docs/DESIGN.md`. Tuyệt đối không sử dụng mã hex ngoài danh sách này:

| Tên Token        | Mã HEX    | Vai trò quy chuẩn trong Master Layout                                                        |
| :--------------- | :-------- | :------------------------------------------------------------------------------------------- |
| `primary`        | `#0075de` | Thanh chỉ báo menu đang chọn (Active indicator bar), Icon Logo chính, Link điều hướng chính. |
| `primary-active` | `#005bab` | Trạng thái nhấn giữ các hành động chính.                                                     |
| `canvas-soft`    | `#f6f5f4` | Nền toàn trang bao phủ phía sau, nền hover cho hàng menu và nút phụ.                         |
| `surface`        | `#ffffff` | Nền Header, nền Sidebar, nền Card, nền Dropdown/Popover, nền Avatar fallback.                |
| `hairline`       | `#e6e6e6` | Viền phân cách dưới Header, viền phải Sidebar, viền chia hàng trong menu và popover.         |
| `ink`            | `#000000` | Chữ tiêu đề trang/card (`heading-1`, `heading-3`), tên người dùng, chữ active item.          |
| `ink-secondary`  | `#31302e` | Chữ menu bình thường, icon điều hướng inactive.                                              |
| `ink-muted`      | `#615d59` | Chữ chức vụ, thời gian thông báo, icon phụ, mũi tên thu gọn.                                 |
| `ink-faint`      | `#a39e98` | Chữ bản quyền footer, số phiên bản hệ thống.                                                 |
| `accent-green`   | `#1aae39` | Badge trạng thái hoạt động trực tuyến, đơn đã duyệt.                                         |
| `accent-orange`  | `#dd5b00` | Badge số lượng thông báo chờ xử lý trên Header.                                              |
| `accent-danger`  | `#dc2626` | Chữ nút Đăng xuất trong dropdown, badge cảnh báo khẩn cấp.                                   |

---

## 4. Dữ liệu mẫu thực tế (HRM Mock Data)

Dữ liệu tiếng Việt thực tế dành cho render giao diện:

```json
{
  "currentUser": {
    "id": "usr-8839102",
    "employeeId": "EMP-00128",
    "fullName": "Nguyễn Văn An",
    "email": "an.nguyen@hrmcorp.vn",
    "avatarUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80",
    "initials": "NA",
    "position": "Trưởng phòng Nhân sự",
    "department": "Phòng Quản trị Nguồn nhân lực",
    "roles": ["HR", "MANAGER"]
  },
  "navigationMenu": [
    {
      "id": "nav-dashboard",
      "label": "Tổng quan",
      "path": "/dashboard",
      "iconName": "LayoutDashboard",
      "badgeCount": 0,
      "isActive": true
    },
    {
      "id": "nav-employees",
      "label": "Nhân viên & Phòng ban",
      "path": "/employees",
      "iconName": "Users",
      "badgeCount": 0,
      "isActive": false
    },
    {
      "id": "nav-attendance",
      "label": "Chấm công & Ca làm",
      "path": "/attendance",
      "iconName": "ClockCheck",
      "badgeCount": 0,
      "isActive": false
    },
    {
      "id": "nav-leaves",
      "label": "Quản lý Nghỉ phép",
      "path": "/leave-requests",
      "iconName": "CalendarOff",
      "badgeCount": 3,
      "isActive": false
    },
    {
      "id": "nav-payroll",
      "label": "Bảng lương & Phúc lợi",
      "path": "/payroll",
      "iconName": "Receipt",
      "badgeCount": 0,
      "isActive": false
    },
    {
      "id": "nav-settings",
      "label": "Thiết lập hệ thống",
      "path": "/settings",
      "iconName": "Settings",
      "badgeCount": 0,
      "isActive": false
    }
  ],
  "quickNotifications": [
    {
      "id": "notif-01",
      "title": "Đơn nghỉ phép mới chờ duyệt",
      "summary": "Trần Thị Mai (Phòng Kế toán) gửi đơn nghỉ phép năm (2 ngày)",
      "timeAgo": "5 phút trước",
      "isUnread": true,
      "severity": "NORMAL"
    },
    {
      "id": "notif-02",
      "title": "Bất thường chấm công",
      "summary": "Lê Hoàng Long check-in muộn 35 phút ca Sáng",
      "timeAgo": "1 giờ trước",
      "isUnread": true,
      "severity": "WARNING"
    },
    {
      "id": "notif-03",
      "title": "Kỳ lương sẵn sàng thẩm định",
      "summary": "Kỳ lương Tháng 09/2026 đã hoàn tất tính toán sơ bộ",
      "timeAgo": "Hôm qua",
      "isUnread": false,
      "severity": "NORMAL"
    }
  ],
  "systemFooter": {
    "systemName": "HRM System - Enterprise Human Resource Platform",
    "version": "v1.2.0-rc3",
    "copyright": "© 2026 HRM System Enterprise. All rights reserved."
  }
}
```
