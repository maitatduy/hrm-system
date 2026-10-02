# Đặc tả thiết kế giao diện (Design Brief): Hành động Đăng xuất (Logout)

Tài liệu đặc tả kỹ thuật hình ảnh dành cho AI UI generator / Design engine. Tuân thủ tuyệt đối quy chuẩn tại `.docs/ideas/02-logout-idea.md`, `.docs/frontend-plans/02-logout-plan.md` và `.docs/DESIGN.md`.

---

## 1. Hệ thống lưới và bố cục (Grid & Layout System)

### 1.1. Cấu trúc khung gốc (Root Frame & Overlay)
- **Viewport tổng thể**: `fixed inset-0 z-50 flex items-center justify-center p-4`.
- **Cơ chế lớp phủ (Backdrop)**: Phủ toàn bộ màn hình, căn giữa hộp thoại xác nhận theo cả hai trục ngang và dọc (`flex items-center justify-center`).
- **Khóa cuộn trang**: Khóa thanh cuộn trang gốc khi modal mở (`overflow-hidden` trên `<body>`).

### 1.2. Bố cục khối chính (Confirmation Modal Layout)
- **Khung chứa chính (`DialogContent`)**:
  - Chiều rộng: `w-full max-w-[440px]` (modal nhỏ gọn, vừa tầm mắt).
  - Hướng xếp chồng: `flex flex-col gap-6` (token `spacing-lg`: 24px).
  - Lớp đệm trong: `p-6` (token `spacing-lg`: 24px).
- **Phân cấp bên trong Modal**:
  - Phần đầu (`DialogHeader`): Cụm icon cảnh báo xếp trên, tiêu đề và mô tả xếp dọc căn giữa (`flex flex-col items-center text-center gap-2`).
  - Phần thân nội dung: Không có form nhập liệu, chỉ có văn bản cảnh báo ngắn gọn.
  - Phần chân (`DialogFooter`): Hàng ngang 2 nút hành động căn sát lề phải hoặc chia đều linh hoạt trên mobile (`flex items-center justify-end gap-3`).

### 1.3. Bảng quy đổi Spacing áp dụng
- `spacing-xs`: `4px` (`gap-1`, `p-1`) - Khoảng cách đệm micro trong icon, padding phụ.
- `spacing-sm`: `8px` (`gap-2`, `p-2`) - Khoảng cách giữa tiêu đề và mô tả, padding trong dropdown menu item.
- `spacing-md`: `16px` (`gap-3` đến `gap-4`, `p-4`) - Khoảng cách giữa nút Hủy và nút Đăng xuất trong footer, khoảng cách trên dropdown popover.
- `spacing-lg`: `24px` (`gap-6`, `p-6`) - Padding trong của thẻ hộp thoại (`DialogContent`), khoảng cách giữa header và footer.

---

## 2. Đặc tả chi tiết Dumb Component

> Chỉ quy định các component được gắn nhãn `[DUMB]` từ `.docs/frontend-plans/02-logout-plan.md`. Bỏ qua toàn bộ component `[SMART]`.

### 2.1. `UserProfileDropdown` [SHARED UI]
- **Box style**: Popover nổi `absolute right-0 top-full mt-2 w-56 bg-[#ffffff]` (`surface`), bo góc **`rounded-md` (8px)**, viền hairline **`border border-[#e6e6e6]`**, bóng mờ đa tầng `shadow-[0_4px_20px_rgba(0,0,0,0.08)]`.
- **Lớp đệm**: `py-1 px-1`.

### 2.2. `DropdownTrigger` [SHARED UI]
- **Box style**: Nút bấm kích hoạt menu `flex items-center gap-2 p-1.5 rounded-md hover:bg-[#f6f5f4] transition-colors cursor-pointer`.
- **Trạng thái**: *Active/Focus* có viền hairline mờ hoặc hiệu ứng nền `canvas-soft` (`#f6f5f4`).

### 2.3. `DropdownMenu` [SHARED UI]
- **Box style**: Khung danh sách chứa các mục lựa chọn `flex flex-col gap-0.5`.

### 2.4. `DropdownMenuItem` [SHARED UI]
- **Box style**: Khối mục menu `flex items-center gap-2.5 px-3 py-2 rounded-xs cursor-pointer select-none transition-colors`.
- **Typography**: Font **`body-sm`** (14px, trọng số 400), màu chữ `#000000` (`ink`).
- **Trạng thái tương tác**:
  - *Hover*: Nền chuyển sang `#f6f5f4` (`canvas-soft`), chữ giữ `#000000` (`ink`).
  - *Active*: Nền đậm hơn nhẹ.

### 2.5. `DropdownDivider` [SHARED UI]
- **Box style**: Đường gạch phân chia `my-1 h-[1px] w-full bg-[#e6e6e6]` (`hairline`).

### 2.6. `DropdownMenuItemLogout`
- **Box style**: Mục đăng xuất trong dropdown `flex items-center gap-2.5 px-3 py-2 rounded-xs cursor-pointer select-none transition-colors`.
- **Icon**: Icon thoát / Logout `16x16px`, màu `#dc2626` (`accent-danger`).
- **Typography**: Font **`body-sm`** (14px, trọng số 500), màu chữ `#dc2626` (`accent-danger`).
- **Trạng thái tương tác**:
  - *Hover*: Nền chuyển sang màu đỏ nhạt `bg-[#dc2626]/10`, màu chữ giữ `#dc2626` (`accent-danger`).
  - *Active*: Nền `bg-[#dc2626]/15`.

### 2.7. `ConfirmDialog` [SHARED UI]
- **Box style**: Wrapper tổng thể của hộp thoại xác nhận `fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto`.

### 2.8. `DialogOverlay` [SHARED UI]
- **Box style**: Lớp phủ nền mờ `fixed inset-0 z-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200`.
- **Cơ chế**: Nhấp chuột ra ngoài overlay kích hoạt sự kiện đóng modal an toàn.

### 2.9. `DialogContent` [SHARED UI]
- **Box style**: Khối hộp thoại trung tâm `relative z-10 w-full max-w-[440px] bg-[#ffffff]` (`surface`), bo góc **`rounded-lg` (12px)**, viền hairline **`border border-[#e6e6e6]`**, đổ bóng nổi khối `shadow-[0_8px_30px_rgba(0,0,0,0.12)]`.
- **Đệm trong**: `p-6` (24px - `spacing-lg`).
- **Hiệu ứng xuất hiện**: Fade-in kết hợp zoom tỷ lệ từ 95% lên 100% trong 150ms.

### 2.10. `DialogHeader` [SHARED UI]
- **Box style**: Khối phần đầu `flex flex-col items-center text-center gap-3 w-full`.

### 2.11. `DangerAlertIconBadge` [SHARED UI]
- **Box style**: Khối tròn biểu tượng nguy hiểm/cảnh báo `w-12 h-12 flex items-center justify-center rounded-full bg-[#dc2626]/10 text-[#dc2626] mb-1`.
- **Icon**: LogOut / AlertTriangle icon `24x24px`, nét vẽ stroke chuẩn 2px, màu `#dc2626` (`accent-danger`).

### 2.12. `DialogTitle` [SHARED UI]
- **Box style**: Khối văn bản tiêu đề hộp thoại.
- **Typography**: Font **`heading-3`** (22px, đậm 700), màu `#000000` (`ink`), khoảng cách dòng `leading-tight`.
- **Nội dung hiển thị**: "Xác nhận đăng xuất"

### 2.13. `DialogDescription` [SHARED UI]
- **Box style**: Khối văn bản giải thích.
- **Typography**: Font **`body-md`** (15-16px, trọng số 400), màu `#615d59` (`ink-muted`), căn giữa, khoảng cách dòng `leading-relaxed`.
- **Nội dung hiển thị**: "Bạn có chắc chắn muốn kết thúc phiên làm việc? Mọi tác vụ chưa lưu sẽ bị gián đoạn và bạn cần đăng nhập lại để tiếp tục."

### 2.14. `DialogFooter` [SHARED UI]
- **Box style**: Hàng nút thao tác ở chân hộp thoại `flex items-center justify-end gap-3 w-full pt-2`.
- **Layout responsive**: Trên màn hình siêu nhỏ (< 400px), các nút có thể giãn rộng đều `grid grid-cols-2 gap-2`.

### 2.15. `SecondaryButton` [SHARED UI]
- **Box style**: Nút hành động phụ (Hủy) `h-10 px-4 flex items-center justify-center bg-[#ffffff]` (`surface`), viền hairline **`border border-[#e6e6e6]`**, bo góc **`rounded-md` (8px)** đồng nhất trong cùng cụm nút.
- **Typography**: Font **`body-sm`** (14px, trọng số 500), màu `#000000` (`ink`).
- **Trạng thái tương tác**:
  - *Hover*: Nền chuyển sang `#f6f5f4` (`canvas-soft`), viền giữ `#e6e6e6`.
  - *Active*: Nền chuyển `#e6e6e6` (`hairline`), scale nhẹ `scale-[0.99]`.
  - *Disabled*: Độ mờ `opacity-50`, con trỏ `not-allowed`.

### 2.16. `DangerButton` [SHARED UI]
- **Box style**: Nút hành động nguy hiểm/chấm dứt phiên (Đăng xuất) `h-10 px-4 flex items-center justify-center gap-2 bg-[#dc2626]` (`accent-danger`), bo góc **`rounded-md` (8px)** đồng nhất theo DESIGN.md.
- **Typography**: Chữ trắng `#ffffff`, font **`body-sm`** (14px, trọng số 600).
- **Trạng thái tương tác**:
  - *Hover*: Nền chuyển sang màu đỏ sẫm `#b91c1c` (`accent-danger active`).
  - *Active / Pressed*: Nền chuyển `#991b1b`, scale nhẹ `scale-[0.99]`.
  - *Loading / Pending*: Vô hiệu hóa tương tác, hiển thị Spinner tròn trắng (`16x16px`), nhãn chuyển thành "Đang đăng xuất...".
  - *Disabled*: Nền `#dc2626` với độ mờ `opacity-60`, con trỏ `not-allowed`.

---

## 3. Ràng buộc màu sắc (Color Palette Mapping)

Dịch chuyển toàn bộ mã màu dùng trong bản vẽ sang đúng thang token chuẩn đã định nghĩa tại `.docs/DESIGN.md`:

| Tên Token | Mã HEX | Vai trò quy chuẩn trong Hành động Đăng xuất |
| :--- | :--- | :--- |
| `accent-danger` | `#dc2626` | Nút xác nhận đăng xuất (`DangerButton`), icon trong badge cảnh báo (`DangerAlertIconBadge`), chữ và icon mục Đăng xuất trong dropdown (`DropdownMenuItemLogout`). |
| `accent-danger active` | `#b91c1c` | Trạng thái hover và active/pressed của nút xác nhận đăng xuất (`DangerButton`). |
| `surface` | `#ffffff` | Nền hộp thoại modal (`DialogContent`), nền menu dropdown (`UserProfileDropdown`), nền nút Hủy (`SecondaryButton`). |
| `canvas-soft` | `#f6f5f4` | Trạng thái hover của nút Hủy (`SecondaryButton`) và mục trong menu dropdown (`DropdownMenuItem`). |
| `hairline` | `#e6e6e6` | Viền xung quanh hộp thoại modal, viền nút Hủy, viền popover menu, đường kẻ phân cách (`DropdownDivider`). |
| `ink` | `#000000` | Tiêu đề hộp thoại (`DialogTitle`), chữ nút Hủy (`SecondaryButton`), chữ các mục menu thông thường. |
| `ink-secondary` | `#31302e` | Chữ vai trò hoặc thông tin tài khoản phụ trong phần header dropdown. |
| `ink-muted` | `#615d59` | Đoạn mô tả cảnh báo trong hộp thoại (`DialogDescription`). |
| `ink-faint` | `#a39e98` | Chữ gợi ý mờ hoặc phiên bản ứng dụng trong dropdown (nếu có). |
| `primary` | `#0075de` | Đường viền chỉ báo hoặc link xem hồ sơ cá nhân trong dropdown (không dùng cho nút xác nhận trong modal này). |

---

## 4. Dữ liệu mẫu thực tế (HRM Mock Data)

Dữ liệu tiếng Việt thực tế dành cho render và kiểm thử giao diện xác nhận đăng xuất:

```json
{
  "currentUserContext": {
    "fullName": "Nguyễn Văn An",
    "email": "an.nguyen@hrmcorp.vn",
    "avatarUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80",
    "employeeCode": "EMP-2024-0089",
    "position": "Chuyên viên Quản trị Nhân sự",
    "department": "Ban Nhân sự & Tiền lương"
  },
  "dropdownMenu": {
    "headerLabel": "Tài khoản cá nhân",
    "items": [
      {
        "id": "profile",
        "icon": "User",
        "label": "Hồ sơ của tôi",
        "route": "/portal/profile"
      },
      {
        "id": "changePassword",
        "icon": "KeyRound",
        "label": "Đổi mật khẩu",
        "route": "/portal/change-password"
      },
      {
        "id": "divider",
        "isDivider": true
      },
      {
        "id": "logout",
        "icon": "LogOut",
        "label": "Đăng xuất",
        "isDestructive": true
      }
    ]
  },
  "confirmationDialog": {
    "dialogTitle": "Xác nhận đăng xuất",
    "dialogDescription": "Bạn có chắc chắn muốn kết thúc phiên làm việc? Mọi tác vụ chưa lưu sẽ bị gián đoạn và bạn cần đăng nhập lại để tiếp tục.",
    "buttons": {
      "cancel": {
        "label": "Hủy bỏ",
        "variant": "secondary"
      },
      "confirm": {
        "label": "Đăng xuất",
        "loadingLabel": "Đang đăng xuất...",
        "variant": "danger"
      }
    }
  },
  "postLogoutFeedback": {
    "toastType": "info",
    "toastMessage": "Bạn đã đăng xuất khỏi phiên làm việc thành công.",
    "redirectTarget": "/login?reason=logged_out"
  }
}
```
