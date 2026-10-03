# Đặc tả thiết kế giao diện (Design Brief): Master Layout

Tài liệu đặc tả kỹ thuật hình ảnh dành cho AI UI generator / Design engine. Tuân thủ tuyệt đối quy chuẩn tại `.docs/ideas/00-master-layout-idea.md`, `.docs/frontend-plans/00-master-layout-plan.md` và `.docs/DESIGN.md`.

---

## 1. Hệ thống lưới và bố cục (Grid & Layout System)

### 1.1. Cấu trúc khung gốc (Root Frame)
- **Root Container**: `min-h-screen w-full bg-[#f9fafb] flex flex-col relative` (nền `bg-gray-50`).
- **Breakpoints**:
  - Desktop ($\ge$ 1024px): Bố cục cố định 2 vùng gồm Sidebar bên trái (`fixed left-0 top-0 bottom-0`) và Header + Main Content bên phải.
  - Mobile / Tablet (< 1024px): Bố cục 1 cột dọc (`flex-col`), Sidebar ẩn vào Drawer trượt từ cạnh trái với backdrop che phủ toàn màn hình (`fixed inset-0`).

### 1.2. Phân vùng các khối chính (Desktop $\ge$ 1024px)
- **Header**:
  - Vị trí: `sticky top-0 z-30 h-16 w-full bg-[#ffffff] border-b border-[#e5e7eb] flex items-center justify-between px-6` (nền `bg-white`, viền `border-gray-200`).
- **Sidebar**:
  - Vị trí: `fixed left-0 top-0 bottom-0 z-40 bg-[#ffffff] border-r border-[#e5e7eb] flex flex-col justify-between` (nền `bg-white`, viền `border-gray-200`).
  - Chiều rộng mở rộng: `w-64` (256px).
  - Chiều rộng thu gọn (collapsed): `w-20` (80px).
- **Main Content Area**:
  - Vị trí: `flex-1 min-w-0 bg-[#f9fafb] min-h-[calc(100vh-4rem)] p-6 transition-all duration-200` (nền `bg-gray-50`, padding `p-6`).
  - Lề trái (`margin-left`): `ml-64` khi sidebar mở rộng; `ml-20` khi sidebar thu gọn.
- **Trợ lý AI (Floating Widget)**:
  - Vị trí: `fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3` (độc lập hoàn toàn với luồng cuộn trang).

### 1.3. Phân vùng các khối chính (Mobile / Tablet < 1024px)
- **Header**: `sticky top-0 z-30 h-16 w-full bg-[#ffffff] border-b border-[#e5e7eb] flex items-center justify-between px-4`.
- **Sidebar (Mobile Drawer)**: `fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw] bg-[#ffffff] shadow-2xl flex flex-col justify-between`.
- **Drawer Backdrop**: `fixed inset-0 z-40 bg-black/50 backdrop-blur-xs`.
- **Main Content Area**: `w-full ml-0 p-4 bg-[#f9fafb]`.
- **Trợ lý AI**: `fixed bottom-4 right-4 z-50`.

### 1.4. Quy chuẩn khoảng cách (Spacing Scale)
- `spacing-xs`: `4px` (`gap-1`, `p-1`) - Giãn cách các icon phụ, chấm chỉ báo.
- `spacing-sm`: `8px` (`gap-2`, `p-2`) - Khoảng cách giữa các mục menu con, padding trong nút bấm và input.
- `spacing-md`: `16px` (`gap-4`, `p-4`) - Khoảng cách phân vùng trong header, padding trong dropdown và profile card.
- `spacing-lg`: `24px` (`gap-6`, `p-6`) - Padding chính của main content và cửa sổ chat AI.

---

## 2. Đặc tả chi tiết Dumb Component

> Chỉ liệt kê các component mang nhãn `[DUMB]` từ `.docs/frontend-plans/00-master-layout-plan.md`. Bỏ qua toàn bộ component `[SMART]`.

### 2.1. `SidebarLogo` [SHARED UI]
- **Box style**: Khối `flex items-center gap-3 px-4 h-16 border-b border-[#e5e7eb] select-none cursor-pointer`.
  - Icon Box: Kích thước `36x36px`, nền `bg-[#2563eb]` (`bg-blue-600`), bo góc `rounded-lg` (8px), `flex items-center justify-center text-white font-bold text-base shadow-sm`.
- **Typography**:
  - Tên hệ thống: `text-base font-bold text-[#111827]` (`text-gray-900`), tracking-tight.
  - Mô tả phụ: `text-xs text-[#6b7280]` (`text-gray-500`).
- **Trạng thái thu gọn**: Ẩn phần chữ, chỉ hiển thị icon box `36x36px` căn giữa (`mx-auto`).

### 2.2. `SidebarNavList`
- **Box style**: Khung cuộn dọc `flex-1 py-4 px-3 flex flex-col space-y-1 overflow-y-auto`. Không viền, không shadow.

### 2.3. `SidebarNavItem`
- **Box style**: Khối ngang `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 relative select-none cursor-pointer`.
- **Typography**: `text-sm font-medium leading-none`.
- **Trạng thái**:
  - _Active_: Nền `bg-[#eff6ff]` (`bg-blue-50`), chữ và icon màu `text-[#2563eb]` (`text-blue-600`), `font-semibold`.
  - _Inactive_: Nền trong suốt, chữ màu `text-[#374151]` (`text-gray-700`), icon màu `text-[#6b7280]` (`text-gray-500`).
  - _Hover_: Nền chuyển `bg-[#f9fafb]` (`bg-gray-50`), chữ đổi sang `text-[#111827]` (`text-gray-900`).
  - _Collapsed Mode_: `justify-center px-0 h-10 w-10 mx-auto`, ẩn nhãn chữ, chỉ hiển thị icon.

### 2.4. `NavPendingBadge` [SHARED UI]
- **Box style**: Viên thuốc `inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold ml-auto`.
- **Màu sắc**: Nền `bg-[#fef9c3]` (`bg-yellow-100`), chữ `text-[#854d0e]` (`text-yellow-800`).
- **Collapsed Mode**: Chuyển thành chấm tròn `w-2 h-2 rounded-full bg-[#854d0e] absolute top-1 right-1`.

### 2.5. `SidebarUserProfile`
- **Box style**: Khối ngang `flex items-center gap-3 p-4 border-t border-[#e5e7eb] bg-[#ffffff] select-none`.
- **Trạng thái thu gọn**: Căn giữa avatar `justify-center p-3`, ẩn khối văn bản.

### 2.6. `UserAvatar` [SHARED UI]
- **Box style**: Hình tròn `w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm select-none shrink-0`.
- **Màu nền**: Nền gradient `bg-gradient-to-br from-[#3b82f6] to-[#9333ea]` (từ `from-blue-500` đến `to-purple-600`).
- **Typography**: Ký tự in hoa cuối của họ tên, `font-bold text-white text-sm`.

### 2.7. `UserMetaInfo`
- **Box style**: Cột thông tin `flex flex-col min-w-0 leading-tight`.
- **Typography**:
  - Tên người dùng: `text-sm font-semibold text-[#111827]` (`text-gray-900`), `truncate`.
  - Email: `text-xs text-[#6b7280]` (`text-gray-500`), `truncate`.

### 2.8. `DrawerBackdrop`
- **Box style**: `fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity duration-200`.

### 2.9. `HeaderLeftSection`
- **Box style**: Khối `flex items-center gap-4 flex-1 min-w-0`.

### 2.10. `HamburgerButton` [SHARED UI]
- **Box style**: Nút vuông `w-10 h-10 rounded-lg border border-[#e5e7eb] bg-[#ffffff] flex items-center justify-center text-[#374151] transition-colors select-none cursor-pointer`.
- **Trạng thái**:
  - _Hover_: Nền `bg-[#f9fafb]` (`bg-gray-50`), viền `#d1d5db`.
  - _Active_: Scale `scale-95`.

### 2.11. `SearchInput` [SHARED UI]
- **Box style**: Khối bao ngoài `relative w-64 md:w-80 flex items-center`.
  - Input field: `w-full h-10 pl-10 pr-4 rounded-lg border border-[#e5e7eb] bg-[#ffffff] text-sm text-[#111827] placeholder-[#9ca3af] outline-none transition-all`.
  - Search Icon: `absolute left-3 w-4 h-4 text-[#9ca3af] pointer-events-none`.
- **Trạng thái**:
  - _Focus_: Viền `border-[#2563eb]` (`border-blue-600`), vòng sáng `ring-1 ring-[#2563eb]`.
  - _Hover_: Viền `border-[#d1d5db]`.

### 2.12. `QuickSearchResultList`
- **Box style**: Khung nổi `absolute top-12 left-0 w-full bg-[#ffffff] border border-[#e5e7eb] rounded-xl shadow-lg py-2 z-50 max-h-60 overflow-y-auto`.
- **Item**: `px-4 py-2.5 text-sm text-[#374151] hover:bg-[#f9fafb] cursor-pointer flex items-center justify-between`.

### 2.13. `BreadcrumbNavigation` [SHARED UI]
- **Box style**: Khối ngang `hidden md:flex items-center gap-2 text-sm text-[#6b7280] select-none`.
- **Typography**:
  - Phân cấp cha: `text-sm text-[#6b7280]` (`text-gray-500`), hover gạch chân.
  - Phân cách: Dấu gạch chéo `/` màu `text-[#9ca3af]` (`text-gray-400`).
  - Trang hiện tại: `text-sm font-semibold text-[#111827]` (`text-gray-900`).

### 2.14. `HeaderRightSection`
- **Box style**: Khối `flex items-center gap-4 shrink-0`.

### 2.15. `NotificationTriggerBtn` [SHARED UI]
- **Box style**: Nút tròn/vuông bo góc `relative w-10 h-10 rounded-lg border border-[#e5e7eb] bg-[#ffffff] flex items-center justify-center text-[#374151] hover:bg-[#f9fafb] transition-colors cursor-pointer`.
- **Icon**: Chuông kích thước `20x20px`.

### 2.16. `NotificationUnreadBadge` [SHARED UI]
- **Box style**: Chấm tròn `absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#dc2626] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#ffffff] shadow-xs`.

### 2.17. `NotificationDropdownList`
- **Box style**: Khung menu nổi `absolute right-0 top-12 w-80 md:w-96 bg-[#ffffff] border border-[#e5e7eb] rounded-xl shadow-lg overflow-hidden z-50 flex flex-col`.

### 2.18. `NotificationHeader`
- **Box style**: `px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between bg-[#ffffff]`.
- **Typography**: Tiêu đề `text-sm font-bold text-[#111827]` (`text-gray-900`), nút thao tác `text-xs font-medium text-[#2563eb] hover:underline cursor-pointer`.

### 2.19. `NotificationItem`
- **Box style**: `p-4 border-b border-[#e5e7eb] last:border-b-0 flex items-start gap-3 cursor-pointer transition-colors duration-150`.
- **Trạng thái**:
  - _Chưa đọc_: Nền `bg-[#eff6ff]` (`bg-blue-50`), có chấm xanh chỉ báo.
  - _Đã đọc_: Nền `bg-[#ffffff]`, hover `bg-[#f9fafb]`.
- **Typography**:
  - Tiêu đề thông báo: `text-sm font-semibold text-[#111827] leading-snug`.
  - Mô tả tóm tắt: `text-xs text-[#4b5563] mt-0.5 leading-relaxed`.
  - Thời gian: `text-[11px] text-[#6b7280] mt-1`.

### 2.20. `NotificationTypeIcon`
- **Box style**: Khối tròn `w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm`.
- **Màu sắc theo loại**:
  - `LEAVE`: Nền `bg-[#fef9c3] text-[#854d0e]` (`bg-yellow-100 text-yellow-800`).
  - `ATTENDANCE`: Nền `bg-[#fee2e2] text-[#991b1b]` (`bg-red-100 text-red-800`).
  - `PAYROLL`: Nền `bg-[#dcfce7] text-[#166534]` (`bg-green-100 text-green-800`).
  - `SYSTEM`: Nền `bg-[#dbeafe] text-[#1e40af]` (`bg-blue-100 text-blue-800`).

### 2.21. `UnreadDotIndicator`
- **Box style**: Chấm tròn `w-2 h-2 rounded-full bg-[#2563eb] shrink-0 mt-1.5`.

### 2.22. `NotificationFooter`
- **Box style**: `px-4 py-2.5 border-t border-[#e5e7eb] text-center bg-[#f9fafb]`.
- **Typography**: Nút "Xem tất cả thông báo" `text-xs font-semibold text-[#2563eb] hover:underline cursor-pointer`.

### 2.23. `CurrentDateDisplay` [SHARED UI]
- **Box style**: Khối `hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#e5e7eb] bg-[#ffffff] select-none`.
- **Typography**: `text-xs font-medium text-[#4b5563]` (`text-gray-600`), icon lịch `w-4 h-4 text-[#6b7280]`.

### 2.24. `MainContentArea`
- **Box style**: Khung bao quanh `<Outlet />`, nền `bg-[#f9fafb]`, bo góc mặc định phẳng, padding `p-6`, responsive cuộn dọc tự nhiên.

### 2.25. `AIAssistantTriggerButton` [SHARED UI]
- **Box style**: Nút tròn đường kính `w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 select-none cursor-pointer`.
- **Màu sắc**: Gradient độc quyền AI `bg-gradient-to-r from-[#9333ea] to-[#2563eb]` (`from-purple-600 to-blue-600`), icon robot / tia sáng màu trắng `#ffffff`.

### 2.26. `AIAssistantChatDrawer`
- **Box style**: Khung hội thoại nổi `w-96 h-[500px] max-w-[calc(100vw-2rem)] bg-[#ffffff] border border-[#e5e7eb] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200`.

### 2.27. `AIChatHeader`
- **Box style**: Khung `p-4 border-b border-[#e5e7eb] bg-gradient-to-r from-[#9333ea] to-[#2563eb] text-white flex items-center justify-between`.
- **Typography**:
  - Tiêu đề: `text-sm font-bold text-white flex items-center gap-2`.
  - Nút đóng: `text-white/80 hover:text-white cursor-pointer`.

### 2.28. `AIMessageList`
- **Box style**: Vùng cuộn tin nhắn `flex-1 p-4 overflow-y-auto space-y-3 bg-[#f9fafb]`.

### 2.29. `AIMessageBubble`
- **Box style**: Khối bong bóng thoại `max-w-[85%] p-3 rounded-xl text-sm leading-relaxed`.
- **Phân loại**:
  - _User_: Nền `bg-[#2563eb] text-white ml-auto rounded-br-xs`.
  - _Assistant_: Nền `bg-[#ffffff] text-[#111827] border border-[#e5e7eb] mr-auto rounded-bl-xs shadow-xs`.

### 2.30. `AIChatInputBar`
- **Box style**: Khung nhập `p-3 border-t border-[#e5e7eb] bg-[#ffffff] flex items-center gap-2`.
- **Input**: `flex-1 h-9 px-3 rounded-lg border border-[#e5e7eb] text-sm text-[#111827] placeholder-[#9ca3af] outline-none focus:border-[#2563eb]`.
- **Send Button**: `w-9 h-9 rounded-lg bg-gradient-to-r from-[#9333ea] to-[#2563eb] text-white flex items-center justify-center hover:opacity-90 transition-opacity`.

---

## 3. Ràng buộc màu sắc (Color Palette Mapping)

Áp dụng bảng màu Tailwind chuẩn định nghĩa tại `.docs/DESIGN.md`. Tuyệt đối không tự chế mã hex ngoài bảng này:

| Token Tailwind | Mã HEX | Vai trò quy chuẩn trong Master Layout |
| :--- | :--- | :--- |
| `bg-gray-50` | `#f9fafb` | Nền canvas toàn hệ thống, nền hover danh sách, nền khung chat tin nhắn AI. |
| `bg-white` | `#ffffff` | Nền Sidebar, nền Header, nền Card/Dropdown/Popover, nền bong bóng chat AI assistant. |
| `border-gray-200` | `#e5e7eb` | Viền phân cách dưới Header, viền phải Sidebar, viền chia hàng trong dropdown và viền input. |
| `text-gray-900` | `#111827` | Tiêu đề logo, tiêu đề popover, tiêu đề trang breadcrumb, tên người dùng. |
| `text-gray-700` | `#374151` | Chữ menu bình thường (inactive), chữ icon hamburger. |
| `text-gray-600` | `#4b5563` | Chữ tóm tắt nội dung thông báo, chữ hiển thị ngày hiện tại. |
| `text-gray-500` | `#6b7280` | Icon menu chưa chọn, email người dùng ở đáy sidebar, breadcrumb cấp cha. |
| `text-gray-400` | `#9ca3af` | Chữ placeholder ô tìm kiếm, icon kính lúp mờ. |
| `bg-blue-600` | `#2563eb` | Hộp logo, viền focus ô tìm kiếm, bong bóng chat người dùng, chấm unread dot. |
| `hover:bg-blue-700` | `#1d4ed8` | Trạng thái hover của các nút hành động chính. |
| `bg-blue-50` | `#eff6ff` | Nền menu đang active, nền hàng thông báo chưa đọc. |
| `text-blue-600` | `#2563eb` | Chữ và icon menu đang active, link xem tất cả thông báo. |
| `bg-yellow-100` | `#fef9c3` | Nền badge số lượng đơn nghỉ phép chờ duyệt trên menu, nền icon thông báo LEAVE. |
| `text-yellow-800` | `#854d0e` | Chữ badge số lượng chờ duyệt trên menu, chữ icon LEAVE. |
| `bg-red-600` | `#dc2626` | Nền badge chấm đỏ số lượng thông báo chưa đọc trên chuông. |
| `bg-red-100` | `#fee2e2` | Nền icon thông báo sự kiện ATTENDANCE (đi muộn, vắng mặt). |
| `text-red-800` | `#991b1b` | Chữ icon thông báo ATTENDANCE cảnh báo. |
| `bg-green-100` | `#dcfce7` | Nền icon thông báo hoàn tất thanh toán PAYROLL. |
| `text-green-800` | `#166534` | Chữ icon thông báo PAYROLL. |
| `bg-blue-100` | `#dbeafe` | Nền icon thông báo SYSTEM chung. |
| `text-blue-800` | `#1e40af` | Chữ icon thông báo SYSTEM. |
| `AI Gradient Start` | `#9333ea` | Màu bắt đầu (`from-purple-600`) cho nút nổi AI và header chat widget. |
| `AI Gradient End` | `#2563eb` | Màu kết thúc (`to-blue-600`) cho nút nổi AI và header chat widget. |

---

## 4. Dữ liệu mẫu thực tế (HRM Mock Data)

Dữ liệu tiếng Việt thực tế dành cho AI render trực tiếp giao diện:

```json
{
  "currentUser": {
    "id": "usr-emp-00128",
    "fullName": "Phạm Hoàng Nam",
    "email": "nam.pham@hrmcorp.vn",
    "avatarInitials": "N",
    "position": "Trưởng phòng Nhân sự",
    "department": "Phòng Nhân sự & Đào tạo",
    "roles": ["HR", "MANAGER"]
  },
  "currentDate": "Thứ Sáu, ngày 03/10/2026",
  "navigationMenu": [
    {
      "id": "nav-dashboard",
      "label": "Tổng quan",
      "path": "/dashboard",
      "iconName": "LayoutDashboard",
      "isActive": true,
      "pendingCount": 0
    },
    {
      "id": "nav-employees",
      "label": "Nhân viên & Phòng ban",
      "path": "/employees",
      "iconName": "Users",
      "isActive": false,
      "pendingCount": 0
    },
    {
      "id": "nav-attendance",
      "label": "Chấm công & Điểm danh",
      "path": "/attendance",
      "iconName": "ClockCheck",
      "isActive": false,
      "pendingCount": 0
    },
    {
      "id": "nav-leave",
      "label": "Quản lý Nghỉ phép",
      "path": "/leave-requests",
      "iconName": "CalendarOff",
      "isActive": false,
      "pendingCount": 3
    },
    {
      "id": "nav-payroll",
      "label": "Bảng lương & Đãi ngộ",
      "path": "/payroll",
      "iconName": "Banknote",
      "isActive": false,
      "pendingCount": 0
    },
    {
      "id": "nav-settings",
      "label": "Cấu hình hệ thống",
      "path": "/settings",
      "iconName": "Settings",
      "isActive": false,
      "pendingCount": 0
    }
  ],
  "quickNotifications": [
    {
      "id": "notif-01",
      "type": "LEAVE",
      "title": "Đơn nghỉ phép mới chờ duyệt",
      "description": "Lê Thị Hồng Nhung (Ban Kế toán) gửi đơn xin nghỉ phép năm 02 ngày.",
      "timeAgo": "5 phút trước",
      "isUnread": true
    },
    {
      "id": "notif-02",
      "type": "ATTENDANCE",
      "title": "Cảnh báo đi muộn bất thường",
      "description": "Nguyễn Thành Đạt check-in muộn 42 phút tại ca Sáng trụ sở chính.",
      "timeAgo": "1 giờ trước",
      "isUnread": true
    },
    {
      "id": "notif-03",
      "type": "PAYROLL",
      "title": "Kỳ lương Tháng 09/2026 đã sẵn sàng",
      "description": "Dữ liệu tính lương sơ bộ đã được tổng hợp, vui lòng kiểm duyệt trước ngày 05.",
      "timeAgo": "Hôm qua",
      "isUnread": false
    },
    {
      "id": "notif-04",
      "type": "SYSTEM",
      "title": "Bảo trì định kỳ hệ thống",
      "description": "Hệ thống sẽ cập nhật phiên bản vá lỗi hạ tầng từ 23:00 đến 23:30 tối nay.",
      "timeAgo": "2 ngày trước",
      "isUnread": false
    }
  ],
  "aiAssistantDemo": {
    "welcomeMessage": "Xin chào Hoàng Nam! Tôi là trợ lý AI nhân sự. Tôi có thể hỗ trợ gì cho bạn về dữ liệu nhân sự, báo cáo chấm công hay duyệt đơn hôm nay?",
    "sampleSuggestions": [
      "Tổng hợp số nhân viên nghỉ phép hôm nay",
      "Kiểm tra nhân sự chưa chấm công ca sáng",
      "Phân tích tỷ lệ đi làm đúng giờ tuần này"
    ]
  }
}
```
