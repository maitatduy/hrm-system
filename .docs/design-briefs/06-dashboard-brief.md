# Design brief: màn hình tổng quan (Dashboard)

Nguồn: `.docs/ideas/06-dashboard-idea.md`, `.docs/frontend-plans/06-dashboard-plan.md`.
Màu, bo góc và cỡ chữ dùng đúng token trong `frontend/src/index.css` để đồng bộ với các màn đã code (master layout, xác thực, cài đặt). Không dùng palette Tailwind mặc định, không thêm mã hex ngoài bảng token ở mục 3.

## 1. Lưới và bố cục

### Root
- Trang nằm trong Master Layout đã có: header cố định `h-16` nền `surface`, sidebar `w-64` từ md, vùng nội dung `flex-1 p-6 bg-canvas-soft`.
- Khung nội dung dashboard: `w-full max-w-7xl flex flex-col gap-6`.

### Thứ tự khối
| Hàng | Desktop (lg ≥ 1024px) | Tablet (md) | Mobile |
| :-- | :-- | :-- | :-- |
| 1. PageHeader | 1 cột | 1 cột | 1 cột |
| 2. StatsGrid | `grid grid-cols-4 gap-6` | `grid-cols-2` | `grid-cols-1` |
| 3. Biểu đồ | `grid grid-cols-2 gap-6` | `grid-cols-1` | `grid-cols-1` |
| 4. Hoạt động + sự kiện | `grid grid-cols-3 gap-6`, hoạt động `col-span-2`, sự kiện `col-span-1` | `grid-cols-1` | `grid-cols-1` |

### Khoảng cách
| Vị trí | Giá trị |
| :-- | :-- |
| Giữa các hàng, giữa các card cùng hàng | `gap-6` (24px) |
| Padding trong card | `p-6` (24px), giống `SettingsCard` |
| Giữa tiêu đề card và nội dung | `mb-4` (16px) |
| Giữa các dòng hoạt động | `divide-y divide-hairline`, mỗi dòng `py-3` |
| Giữa các EventCard | `gap-3` (12px) |
| Bên trong StatCard giữa nhãn, giá trị, xu hướng | `gap-1.5` (6px) |

## 2. Đặc tả component [DUMB]

Nguyên tắc chung: tối giản như các màn đã code. Chỉ dùng icon ở chỗ có ý nghĩa (khối icon của StatCard, mũi tên xu hướng, icon lỗi), không thêm icon trang trí.

### PageHeader [SHARED UI]
- Box: không nền, không viền.
- Tiêu đề `h1`: 20px (`text-xl`) đậm 700, `ink`, giống tiêu đề `DashboardPage` hiện tại. Nội dung "Tổng quan".
- Mô tả phụ dưới tiêu đề: 14px, `ink-muted`, `mt-1`, ngày hôm nay dạng "Thứ Hai, 12/10/2026".

### StatsGrid
- Lưới chứa 4 `StatCard`, theo bảng responsive ở mục 1.

### StatCard [SHARED UI]
- Box: `bg-surface border border-hairline rounded-lg p-6 shadow-xs`, giống `SettingsCard`. Không click được nên không có hover.
- Bố cục: `flex items-start justify-between`. Trái: nhãn, giá trị, TrendBadge xếp dọc. Phải: khối icon.
- Nhãn: 14px đậm 500, `ink-muted`.
- Giá trị: 30px (`text-3xl`) đậm 700, `ink`. Số phân cách hàng nghìn kiểu Việt Nam (`1.248`).
- Khối icon: `w-11 h-11 rounded-md flex items-center justify-center`, icon 22px, nền và màu theo tone.

| Thẻ | Icon (lucide) | Tone | Nền khối icon | Màu icon |
| :-- | :-- | :-- | :-- | :-- |
| Tổng nhân viên | `Users` | primary | `primary` 10% | `primary` |
| Đi làm hôm nay | `UserCheck` | green | `accent-green` 10% | `accent-green` |
| Đang nghỉ phép | `CalendarOff` | orange | `accent-orange` 10% | `accent-orange` |
| Vị trí đang tuyển | `Briefcase` | neutral | `canvas-soft` | `ink-secondary` |

### TrendBadge [SHARED UI]
- Dòng chữ nhỏ: `inline-flex items-center gap-1`, 13px.
- Icon `TrendingUp` / `TrendingDown` 14px, phần trăm đậm 600, sau đó chú thích `ink-faint` "so với tháng trước".
- Màu theo ý nghĩa, không theo dấu:
  - Tốt: `accent-green` (tăng nhân viên, tăng đi làm, giảm vị trí còn trống).
  - Xấu: `accent-danger` (tăng số người nghỉ phép, giảm đi làm).
  - Không đổi (0%): `ink-muted`, icon `Minus`.

### SectionCard [SHARED UI]
- Box: `bg-surface border border-hairline rounded-lg p-6 shadow-xs`.
- Header: `flex items-center justify-between mb-4`. Tiêu đề 16px đậm 700 `ink`. Slot `action` bên phải là link chữ 14px đậm 500 `primary`, hover gạch chân, active `primary-active`, ví dụ "Xem tất cả".

### AttendanceTrendChart
- Kích thước `w-full h-72`.
- Đường: `primary` `#0075de`, nét 2px, điểm tròn 4px viền `surface` 2px, điểm khi hover 6px.
- Vùng dưới đường: `primary` độ mờ 8%.
- Lưới ngang: `hairline` `#e6e6e6` nét đứt, không có lưới dọc.
- Trục X nhãn tháng "T5" đến "T10", trục Y 0% đến 100% bước 25%, chữ 12px `ink-muted`, không vẽ đường trục.
- Tooltip: `bg-surface border border-hairline rounded-md shadow-[0_8px_28px_rgba(0,0,0,0.1)] px-3 py-2`, giống menu tài khoản. Dòng 1 "Tháng 10/2026" 13px `ink-muted`, dòng 2 "96,2%" 15px đậm 600 `ink`.

### DepartmentPieChart
- Dạng donut: `h-64`, bán kính trong 62%, khe hở giữa các lát 2px màu `surface`.
- Màu từng lát lấy từ dữ liệu phòng ban (mục 3).
- Giữa donut: tổng nhân viên 30px đậm 700 `ink`, dưới là "nhân viên" 13px `ink-muted`.
- Hover lát: lát đó nổi ra 4px, các lát khác giảm độ mờ còn 35%, đồng bộ với dòng tương ứng trong ChartLegend.
- Bố cục trong card: desktop `flex items-center gap-6` (biểu đồ trái, legend phải), mobile xếp dọc.

### ChartLegend [SHARED UI]
- Danh sách `flex flex-col gap-1`, mỗi dòng `flex items-center justify-between gap-3 px-2 py-1.5 rounded-md`.
- Trái: chấm màu `w-2.5 h-2.5 rounded-full` + tên phòng ban 14px `ink-secondary`.
- Phải: số nhân viên 14px đậm 600 `ink` + phần trăm 13px `ink-faint`.
- Hover hoặc đang active: nền `canvas-soft`.

### ActivityList
- Danh sách `divide-y divide-hairline`, tối đa 10 dòng, không cuộn trong card.

### ActivityItem
- Dòng `flex items-center gap-3 py-3`.
- Trái: `Avatar` cỡ md.
- Giữa (`flex-1 min-w-0`):
  - Dòng 1, 14px `ink-secondary`, cắt chữ khi dài: tên nhân viên đậm 600 `ink` + hành động.
  - Dòng 2, 13px `ink-muted`: tên phòng ban.
- Phải: thời gian tương đối 13px `ink-faint`, không xuống dòng, ví dụ "5 phút trước".

### Avatar [SHARED UI]
- Tổng quát hóa từ `UserAvatar` đã có: `rounded-full`, nền `avatar` `#d5e3ff`, chữ `avatar-ink` `#005db2` đậm 700.
- Nội dung: hai chữ cái viết tắt từ chữ đầu của từ đầu và từ cuối trong tên, ví dụ "Nguyễn Văn An" → "NA". Không có tên thì lấy hai ký tự đầu của email như hiện tại.
- Cỡ: sm `w-8 h-8` chữ 12px, md `w-10 h-10` chữ 14px.

### EventList
- Danh sách `flex flex-col gap-3`, tối đa 5 sự kiện.

### EventCard
- Box: `flex items-center gap-3.5 p-3 border border-hairline rounded-md`, hover nền `canvas-soft`.
- Khối ngày bên trái: `w-12 h-12 rounded-md bg-canvas-soft flex flex-col items-center justify-center`, thứ 11px đậm 600 `ink-muted` viết hoa, ngày 18px đậm 700 `ink`.
- Giữa (`flex-1 min-w-0`): tiêu đề 14px đậm 500 `ink` cắt chữ khi dài, dưới là giờ 13px `ink-muted`.
- Phải: badge loại sự kiện `inline-flex items-center px-2 py-0.5 rounded-full` 12px đậm 500, màu ở mục 3.

### Skeleton [SHARED UI]
- Khối `bg-canvas-soft rounded-md animate-pulse`, giữ đúng kích thước khối thật (StatCard, chart `h-72`, dòng hoạt động, EventCard) để trang không nhảy khi dữ liệu về.

### SectionErrorState [SHARED UI]
- Thay phần thân card, card vẫn giữ tiêu đề. `flex flex-col items-center justify-center gap-3 py-10 text-center`.
- Message 14px `ink-muted`, ví dụ "Không tải được dữ liệu". Không icon.
- Nút "Thử lại": `Button` variant secondary đã có, `h-10`, nền `surface`, viền `hairline`, hover `canvas-soft`. Đang tải lại: chỉ hiện vòng quay, nút bị khóa.

### EmptyState [SHARED UI]
- `py-10 text-center` 14px `ink-faint`, ví dụ "Chưa có hoạt động nào".

## 3. Ràng buộc màu sắc

Token chung:

| Token | Hex | Dùng cho |
| :-- | :-- | :-- |
| `canvas-soft` | `#f6f5f4` | nền trang, khối ngày EventCard, nền hover, skeleton, khối icon thẻ trung tính |
| `surface` | `#ffffff` | nền card, tooltip |
| `hairline` | `#e6e6e6` | viền card, đường chia danh sách, lưới biểu đồ |
| `ink` | `#000000` | tiêu đề, giá trị, tên nhân viên |
| `ink-secondary` | `#31302e` | nội dung hoạt động, tên phòng ban trong legend, icon thẻ trung tính |
| `ink-muted` | `#615d59` | mô tả phụ, nhãn thẻ, trục biểu đồ, giờ sự kiện |
| `ink-faint` | `#a39e98` | thời gian tương đối, chú thích xu hướng, phần trăm legend, trạng thái rỗng |
| `primary` | `#0075de` | đường biểu đồ, link "Xem tất cả", thẻ Tổng nhân viên |
| `primary-active` | `#005bab` | link khi nhấn |
| `accent-green` | `#1aae39` | xu hướng tốt, thẻ Đi làm hôm nay |
| `accent-orange` | `#dd5b00` | thẻ Đang nghỉ phép |
| `accent-danger` | `#dc2626` | xu hướng xấu |
| `avatar` | `#d5e3ff` | nền avatar |
| `avatar-ink` | `#005db2` | chữ avatar |

Badge loại sự kiện:

| Loại | Nền | Chữ |
| :-- | :-- | :-- |
| Họp (`MEETING`) | `primary` 10% | `primary` `#0075de` |
| Phỏng vấn (`INTERVIEW`) | `avatar` `#d5e3ff` | `avatar-ink` `#005db2` |
| Đào tạo (`TRAINING`) | `canvas-soft` `#f6f5f4` | `ink-secondary` `#31302e` |
| Ngày nghỉ (`HOLIDAY`) | `accent-green` 10% | `accent-green` `#1aae39` |
| Sinh nhật (`BIRTHDAY`) | `accent-orange` 10% | `accent-orange` `#dd5b00` |

Màu phòng ban trên biểu đồ tròn (backend trả về, chỉ được chọn trong các token sau):

| Phòng ban | Token | Hex |
| :-- | :-- | :-- |
| Kỹ thuật | `primary` | `#0075de` |
| Kinh doanh | `accent-green` | `#1aae39` |
| Marketing | `accent-orange` | `#dd5b00` |
| Kế toán | `accent-danger` | `#dc2626` |
| Nhân sự | `ink-secondary` | `#31302e` |
| Hành chính | `ink-faint` | `#a39e98` |

## 4. Dữ liệu mẫu

```json
{
  "pageHeader": { "title": "Tổng quan", "subtitle": "Thứ Hai, 12/10/2026" },
  "metrics": [
    { "key": "totalEmployees", "label": "Tổng nhân viên", "value": 248, "tone": "primary", "trend": { "changePercent": 3.8, "isPositiveGood": true } },
    { "key": "presentToday", "label": "Đi làm hôm nay", "value": 231, "tone": "green", "trend": { "changePercent": 1.2, "isPositiveGood": true } },
    { "key": "onLeaveToday", "label": "Đang nghỉ phép", "value": 9, "tone": "orange", "trend": { "changePercent": 12.5, "isPositiveGood": false } },
    { "key": "openPositions", "label": "Vị trí đang tuyển", "value": 6, "tone": "neutral", "trend": { "changePercent": -14.3, "isPositiveGood": true } }
  ],
  "attendanceTrend": {
    "title": "Tỷ lệ chuyên cần 6 tháng",
    "points": [
      { "month": "2026-05", "label": "T5", "rate": 94.1 },
      { "month": "2026-06", "label": "T6", "rate": 95.3 },
      { "month": "2026-07", "label": "T7", "rate": 92.8 },
      { "month": "2026-08", "label": "T8", "rate": 93.6 },
      { "month": "2026-09", "label": "T9", "rate": 95.9 },
      { "month": "2026-10", "label": "T10", "rate": 96.2 }
    ]
  },
  "departmentDistribution": {
    "title": "Nhân viên theo phòng ban",
    "total": 248,
    "shares": [
      { "departmentName": "Kỹ thuật", "employeeCount": 86, "color": "#0075de" },
      { "departmentName": "Kinh doanh", "employeeCount": 54, "color": "#1aae39" },
      { "departmentName": "Marketing", "employeeCount": 32, "color": "#dd5b00" },
      { "departmentName": "Kế toán", "employeeCount": 28, "color": "#dc2626" },
      { "departmentName": "Nhân sự", "employeeCount": 18, "color": "#31302e" },
      { "departmentName": "Hành chính", "employeeCount": 30, "color": "#a39e98" }
    ]
  },
  "recentActivities": {
    "title": "Hoạt động gần đây",
    "action": "Xem tất cả",
    "items": [
      { "employeeName": "Nguyễn Văn An", "initials": "NA", "action": "đã chấm công vào lúc 08:02", "departmentName": "Kỹ thuật", "relativeTime": "5 phút trước" },
      { "employeeName": "Trần Thị Bình", "initials": "TB", "action": "gửi đơn nghỉ phép năm 2 ngày (14/10 - 15/10)", "departmentName": "Kinh doanh", "relativeTime": "18 phút trước" },
      { "employeeName": "Lê Hoàng Cường", "initials": "LC", "action": "được duyệt nghỉ ốm 1 ngày", "departmentName": "Kế toán", "relativeTime": "42 phút trước" },
      { "employeeName": "Phạm Minh Dũng", "initials": "PD", "action": "gia nhập công ty, vị trí Kỹ sư Backend", "departmentName": "Kỹ thuật", "relativeTime": "1 giờ trước" },
      { "employeeName": "Hoàng Thu Hà", "initials": "HH", "action": "cập nhật hồ sơ cá nhân", "departmentName": "Marketing", "relativeTime": "2 giờ trước" },
      { "employeeName": "Vũ Quốc Khánh", "initials": "VK", "action": "gửi đơn làm việc từ xa ngày 13/10", "departmentName": "Kỹ thuật", "relativeTime": "3 giờ trước" }
    ]
  },
  "upcomingEvents": {
    "title": "Sự kiện sắp tới",
    "items": [
      { "title": "Họp giao ban phòng Nhân sự", "type": "MEETING", "typeLabel": "Họp", "dayLabel": "T3", "date": "13", "time": "09:00 - 10:00" },
      { "title": "Phỏng vấn ứng viên Kỹ sư Frontend", "type": "INTERVIEW", "typeLabel": "Phỏng vấn", "dayLabel": "T4", "date": "14", "time": "14:00 - 15:00" },
      { "title": "Đào tạo an toàn thông tin quý IV", "type": "TRAINING", "typeLabel": "Đào tạo", "dayLabel": "T5", "date": "15", "time": "08:30 - 11:30" },
      { "title": "Sinh nhật Trần Thị Bình", "type": "BIRTHDAY", "typeLabel": "Sinh nhật", "dayLabel": "T6", "date": "16", "time": "Cả ngày" },
      { "title": "Nghỉ lễ Ngày Phụ nữ Việt Nam", "type": "HOLIDAY", "typeLabel": "Ngày nghỉ", "dayLabel": "T3", "date": "20", "time": "Cả ngày" }
    ]
  },
  "states": {
    "empty": { "activities": "Chưa có hoạt động nào", "events": "Không có sự kiện sắp tới" },
    "error": { "message": "Không tải được dữ liệu", "retry": "Thử lại" }
  }
}
```
