# Design brief: bố cục toàn cục (Master Layout)

Nguồn: `.docs/ideas/00-master-layout-idea.md`, `.docs/frontend-plans/00-master-layout-plan.md`. Token màu lấy từ `frontend/src/index.css`.

## 1. Lưới và bố cục

- Trang: `min-h-screen flex flex-col bg-canvas-soft`.
- Header: cố định trên cùng `h-16 w-full z-40 px-6`, `flex items-center justify-between`.
- Dưới header: `pt-16 flex flex-1`.
  - Sidebar: `w-64 p-4`, ẩn dưới md, hiện từ md trở lên.
  - Nội dung chính: `flex-1 p-6 flex flex-col gap-6`.
- Mobile: chỉ còn header và nội dung, sidebar ẩn.

## 2. Đặc tả component

### Header
- Nền `surface`, viền dưới `hairline`, `shadow-xs`.
- Trái: chữ "HRM System" 18px đậm 700 `ink`, bấm về trang chủ theo vai trò. Không logo.
- Phải: `UserMenu`, xem `02-logout-brief.md`.

### Sidebar
- Nền `surface`, viền phải `hairline`. Danh sách `flex flex-col gap-1`, không icon.
- Mục: `px-3 py-2 rounded-md` chữ 14px.
  - Đang chọn: nền `primary` 10%, chữ `primary` đậm 600.
  - Thường: chữ `ink-secondary`, hover nền `canvas-soft`.
  - Focus bằng bàn phím: `ring-2` `primary` 30%.
- Chỉ hiện mục đã có trang: "Tổng quan", "Cài đặt".

### DashboardPage
- Chỉ có tiêu đề trang 20px đậm 700 `ink`.

### Màn chờ của ProtectedRoute
- Toàn màn hình nền `canvas-soft`, chữ 14px `ink-muted` căn giữa: "Đang tải...".
- Lỗi: "Không tải được phiên đăng nhập" và nút primary "Thử lại" `h-10`.

## 3. Màu sắc

| Token | Hex | Dùng cho |
| :-- | :-- | :-- |
| `canvas-soft` | `#f6f5f4` | nền trang, hover mục sidebar |
| `surface` | `#ffffff` | header, sidebar |
| `hairline` | `#e6e6e6` | viền header, viền sidebar |
| `primary` | `#0075de` | mục sidebar đang chọn |
| `ink` | `#000000` | tên hệ thống, tiêu đề trang |
| `ink-secondary` | `#31302e` | mục sidebar thường |
| `ink-muted` | `#615d59` | chữ màn chờ |

## 4. Dữ liệu mẫu

```json
{
  "brand": "HRM System",
  "nav": [
    { "label": "Tổng quan", "to": "/dashboard", "active": true },
    { "label": "Cài đặt", "to": "/settings", "active": false }
  ],
  "pageTitles": {
    "/dashboard": "Tổng quan quản trị nhân sự",
    "/management/dashboard": "Tổng quan quản lý",
    "/portal/dashboard": "Cổng nhân viên"
  },
  "user": { "email": "nguyenvana@hrm.vn", "initials": "NG" }
}
```

## 5. Chưa triển khai

Ô tìm kiếm, breadcrumb, chuông thông báo, ô ngày hiện tại, nút thu gọn sidebar, badge số lượng trên menu, trợ lý AI dạng widget nổi.
