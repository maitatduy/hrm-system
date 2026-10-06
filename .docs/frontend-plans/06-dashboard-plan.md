# Kế hoạch frontend: màn hình tổng quan (Dashboard)

Nguồn: `.docs/ideas/06-dashboard-idea.md`, `.docs/DESIGN.md`, `.agent/rules/frontend-standards.md`. Code đích: `frontend/src/features/dashboard/`, thay cho `routes/pages/DashboardPage.tsx` tạm thời tại route `/dashboard`.

## 1. Phân rã component

### 1.1. Cây component

```
ProtectedRoute allowedRoles=["ADMIN","HR"] [SMART]
└── DashboardLayout [SMART]                                   routes/DashboardLayout.tsx (đã có)
    └── DashboardPage [DUMB]                                  features/dashboard/pages/DashboardPage.tsx
        ├── PageHeader [DUMB] [SHARED UI]                     "Tổng quan" + ngày hôm nay
        ├── StatsOverviewContainer [SMART]                    useDashboardSummaryQuery
        │   └── StatsGrid [DUMB]                              grid 1 / 2 / 4 cột
        │       └── StatCard ×4 [DUMB] [SHARED UI]
        │           └── TrendBadge [DUMB] [SHARED UI]         % tăng giảm so với tháng trước
        ├── div.grid lg:grid-cols-2
        │   ├── AttendanceTrendContainer [SMART]              useAttendanceTrendQuery(6)
        │   │   └── SectionCard [DUMB] [SHARED UI]            "Tỷ lệ chuyên cần 6 tháng"
        │   │       └── AttendanceTrendChart [DUMB]           LineChart
        │   └── DepartmentDistributionContainer [SMART]       useDepartmentDistributionQuery
        │       └── SectionCard [DUMB] [SHARED UI]            "Nhân viên theo phòng ban"
        │           ├── DepartmentPieChart [DUMB]             PieChart
        │           └── ChartLegend [DUMB] [SHARED UI]
        └── div.grid lg:grid-cols-3
            ├── RecentActivitiesContainer [SMART]             useRecentActivitiesQuery(10), lg:col-span-2
            │   └── SectionCard [DUMB] [SHARED UI]            "Hoạt động gần đây"
            │       └── ActivityList [DUMB]
            │           └── ActivityItem [DUMB]
            │               └── Avatar [DUMB] [SHARED UI]
            └── UpcomingEventsContainer [SMART]               useUpcomingEventsQuery(5)
                └── SectionCard [DUMB] [SHARED UI]            "Sự kiện sắp tới"
                    └── EventList [DUMB]
                        └── EventCard [DUMB]

Trạng thái dùng chung cho mọi container:
├── Skeleton [DUMB] [SHARED UI]                               lúc đang tải
├── SectionErrorState [DUMB] [SHARED UI]                      lỗi + nút "Thử lại" (refetch)
└── EmptyState [DUMB] [SHARED UI]                             không có dữ liệu
```

### 1.2. Phân loại và trách nhiệm

| Component | Nhãn | Shared UI | Trách nhiệm |
| :-- | :-- | :-- | :-- |
| `DashboardPage` | DUMB | Không | Chỉ ghép bố cục 3 hàng, không gọi API. Đặt `<title>`. |
| `PageHeader` | DUMB | Có | Tiêu đề trang + mô tả phụ, dùng lại cho mọi trang module. |
| `StatsOverviewContainer` | SMART | Không | Gọi summary, map 4 chỉ số sang `StatCardProps`, xử lý loading/error/empty. |
| `StatsGrid` | DUMB | Không | Lưới 4 thẻ, responsive. |
| `StatCard` | DUMB | Có | Nhãn, giá trị lớn, icon trong khối bo góc, `TrendBadge`. Dùng lại ở đầu mọi trang module theo DESIGN.md mục "Thẻ thống kê". |
| `TrendBadge` | DUMB | Có | Mũi tên tăng/giảm + phần trăm, màu theo chiều tốt/xấu (`isPositiveGood`). |
| `AttendanceTrendContainer` | SMART | Không | Gọi dữ liệu chuyên cần theo tháng, định dạng nhãn tháng. |
| `AttendanceTrendChart` | DUMB | Không | Line chart tỷ lệ %, trục Y 0 đến 100, tooltip. |
| `DepartmentDistributionContainer` | SMART | Không | Gọi phân bổ theo phòng ban, tính tổng và phần trăm. |
| `DepartmentPieChart` | DUMB | Không | Pie/donut chart, màu lấy từ dữ liệu phòng ban. |
| `ChartLegend` | DUMB | Có | Danh sách chú thích màu + nhãn + giá trị, dùng lại cho mọi biểu đồ. |
| `SectionCard` | DUMB | Có | Card trắng có tiêu đề, slot `action` bên phải, slot nội dung. |
| `RecentActivitiesContainer` | SMART | Không | Gọi danh sách hoạt động, tự làm mới định kỳ. |
| `ActivityList`, `ActivityItem` | DUMB | Không | Dòng gồm avatar, "Tên nhân viên + hành động", phòng ban, thời gian tương đối. |
| `Avatar` | DUMB | Có | Tổng quát hóa từ `features/auth/components/UserAvatar`, nhận `name` hoặc `email`, chuyển vào `src/components/`. |
| `UpcomingEventsContainer` | SMART | Không | Gọi sự kiện sắp tới. |
| `EventList`, `EventCard` | DUMB | Không | Card nhỏ: khối ngày (thứ, ngày, tháng), tiêu đề, giờ, badge loại sự kiện. |
| `Skeleton`, `SectionErrorState`, `EmptyState` | DUMB | Có | Trạng thái tải, lỗi, rỗng dùng chung toàn dự án. |

### 1.3. Nguyên tắc kỹ thuật

- Mỗi khối (thẻ thống kê, từng biểu đồ, từng danh sách) là một container và query riêng. Khối nào lỗi chỉ khối đó báo lỗi và có nút thử lại, các khối khác vẫn hiển thị.
- Biểu đồ dùng một thư viện duy nhất cho cả dự án (đề xuất Recharts). Chỉ dumb chart import thư viện này, container không phụ thuộc thư viện vẽ.
- Lazy load các dumb chart bằng `React.lazy` + `Suspense`, vì thư viện biểu đồ nặng và chỉ cần ở dashboard.
- Thời gian từ backend là UTC, chỉ đổi sang múi giờ người dùng ở frontend qua `src/lib/date.ts` (`formatRelativeTime`, `formatDate`, `formatTime`, dùng `Intl` locale `vi-VN`).
- Nhãn, tiêu đề và message của màn hình nằm trong `src/constants/messages.ts` (nhóm `DASHBOARD_MESSAGES`).
- Mọi request đi qua `apiClient` tới api-gateway.

### 1.4. API dự kiến (cần backend chốt)

| Hook | Endpoint qua gateway | Service |
| :-- | :-- | :-- |
| `useDashboardSummaryQuery` | `GET /api/employees/statistics/summary`, `GET /api/attendances/statistics/today`, `GET /api/leave-requests/statistics/today`, `GET /api/job-postings/statistics/open` | employee, attendance, leave, recruitment |
| `useAttendanceTrendQuery` | `GET /api/attendances/statistics/monthly-rate?months=6` | attendance |
| `useDepartmentDistributionQuery` | `GET /api/employees/statistics/by-department` | employee |
| `useRecentActivitiesQuery` | `GET /api/activities?limit=10` | chưa có chủ sở hữu, cần chốt |
| `useUpcomingEventsQuery` | `GET /api/events/upcoming?limit=5` | chưa có chủ sở hữu, cần chốt |

- `useDashboardSummaryQuery` dùng `useQueries` gọi song song 4 endpoint rồi gộp lại, mỗi thẻ có trạng thái riêng.
- Gateway hiện chưa có route cho recruitment-service, cần bổ sung `Path=/api/job-postings/**`.
- Phương án thay thế khi số liệu tăng: một endpoint tổng hợp `GET /api/dashboard/overview` ở một BFF, giảm 4 request xuống 1.

## 2. Quản lý trạng thái

| State | Tầng | Ghi chú |
| :-- | :-- | :-- |
| Bốn chỉ số thống kê | TanStack Query `["dashboard", "summary", <metric>]` | `staleTime` 5 phút, `refetchOnWindowFocus: true` |
| Chuyên cần theo tháng | TanStack Query `["dashboard", "attendance-trend", { months }]` | `staleTime` 30 phút, dữ liệu theo tháng ít thay đổi |
| Phân bổ theo phòng ban | TanStack Query `["dashboard", "department-distribution"]` | `staleTime` 30 phút |
| Hoạt động gần đây | TanStack Query `["dashboard", "activities", { limit }]` | `refetchInterval` 60 giây, dừng khi tab ẩn |
| Sự kiện sắp tới | TanStack Query `["dashboard", "upcoming-events", { limit }]` | `staleTime` 10 phút |
| Phòng ban đang được hover trên biểu đồ tròn | `useState` trong `DepartmentDistributionContainer` | đồng bộ nổi bật giữa pie và legend |
| Vai trò người dùng | Zustand `useAuthStore` (đã có) | chỉ đọc, `ProtectedRoute` đã chặn vai trò khác |
| Bộ lọc khoảng thời gian | Không có ở phiên bản này | Nếu bổ sung, đặt lên URL `?months=6` để chia sẻ đường dẫn |

- Không lưu dữ liệu dashboard vào Zustand, mọi dữ liệu server chỉ nằm trong cache TanStack Query.
- Không cần state toàn cục mới. Không có form, không dùng React Hook Form.
- Đăng xuất gọi `queryClient.clear()` (đã có), nên cache dashboard không lộ sang phiên người khác.

## 3. Cấu trúc dữ liệu

```ts
// features/dashboard/types.ts

/** Chiều tăng giảm so với tháng trước, giá trị phần trăm đã làm tròn 1 chữ số thập phân. */
export interface MetricTrend {
    readonly changePercent: number;
    readonly comparedTo: "previous_month";
}

export type DashboardMetricKey = "totalEmployees" | "presentToday" | "onLeaveToday" | "openPositions";

export interface DashboardMetric {
    readonly key: DashboardMetricKey;
    readonly value: number;
    readonly trend: MetricTrend | null;
}

export interface AttendanceRatePoint {
    /** Tháng dạng "YYYY-MM". */
    readonly month: string;
    /** Tỷ lệ chuyên cần 0 đến 100. */
    readonly rate: number;
}

export interface DepartmentShare {
    readonly departmentId: string;
    readonly departmentName: string;
    readonly employeeCount: number;
    /** Màu hex do backend quy định cho từng phòng ban. */
    readonly color: string;
}

export type ActivityAction =
    | "CHECKED_IN"
    | "LEAVE_REQUESTED"
    | "LEAVE_APPROVED"
    | "EMPLOYEE_JOINED"
    | "PROFILE_UPDATED";

export interface RecentActivity {
    readonly id: string;
    readonly employeeId: string;
    readonly employeeName: string;
    readonly departmentName: string;
    readonly action: ActivityAction;
    /** ISO 8601 UTC. */
    readonly occurredAt: string;
}

export type EventType = "MEETING" | "INTERVIEW" | "TRAINING" | "HOLIDAY" | "BIRTHDAY";

export interface UpcomingEvent {
    readonly id: string;
    readonly title: string;
    readonly type: EventType;
    /** ISO 8601 UTC. */
    readonly startsAt: string;
    readonly endsAt: string | null;
}
```

```ts
// Props các dumb component chính

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

// src/components/StatCard.tsx [SHARED UI]
export interface StatCardProps {
    readonly label: string;
    readonly value: number;
    readonly icon: LucideIcon;
    readonly tone: "blue" | "green" | "yellow" | "purple";
    readonly trend?: TrendBadgeProps;
    readonly valueFormatter?: (value: number) => string;
}

// src/components/TrendBadge.tsx [SHARED UI]
export interface TrendBadgeProps {
    readonly changePercent: number;
    /** false với chỉ số mà tăng là xấu, ví dụ số người nghỉ phép. */
    readonly isPositiveGood?: boolean;
    readonly caption?: string; // mặc định "so với tháng trước"
}

// src/components/SectionCard.tsx [SHARED UI]
export interface SectionCardProps {
    readonly title: string;
    readonly action?: ReactNode;
    readonly className?: string;
    readonly children: ReactNode;
}

// src/components/ChartLegend.tsx [SHARED UI]
export interface ChartLegendItem {
    readonly id: string;
    readonly label: string;
    readonly value: number;
    readonly color: string;
}

export interface ChartLegendProps {
    readonly items: readonly ChartLegendItem[];
    readonly activeId?: string | null;
    readonly onHover?: (id: string | null) => void;
}

// src/components/SectionErrorState.tsx [SHARED UI]
export interface SectionErrorStateProps {
    readonly message: string;
    readonly onRetry: () => void;
    readonly isRetrying?: boolean;
}

// src/components/EmptyState.tsx [SHARED UI]
export interface EmptyStateProps {
    readonly message: string;
}

// src/components/Avatar.tsx [SHARED UI]
export interface AvatarProps {
    /** Dùng để lấy chữ cái viết tắt, ưu tiên tên, không có thì dùng email. */
    readonly name?: string;
    readonly email?: string;
    readonly size?: "sm" | "md";
}

// features/dashboard/components/AttendanceTrendChart.tsx
export interface AttendanceTrendChartProps {
    readonly points: readonly AttendanceRatePoint[];
    readonly height?: number;
}

// features/dashboard/components/DepartmentPieChart.tsx
export interface DepartmentPieChartProps {
    readonly shares: readonly DepartmentShare[];
    readonly activeDepartmentId: string | null;
    readonly onActiveChange: (departmentId: string | null) => void;
}

// features/dashboard/components/ActivityItem.tsx
export interface ActivityItemProps {
    readonly activity: RecentActivity;
    /** Đã đổi sang giờ địa phương, ví dụ "5 phút trước". */
    readonly relativeTime: string;
}

// features/dashboard/components/EventCard.tsx
export interface EventCardProps {
    readonly event: UpcomingEvent;
    readonly dayLabel: string; // "T2"
    readonly dateLabel: string; // "12/10"
    readonly timeLabel: string; // "09:00 - 10:30"
}
```

```ts
// features/dashboard/hooks — chữ ký hook

export const useDashboardSummaryQuery: () => {
    readonly metrics: readonly (DashboardMetric | undefined)[];
    readonly isLoading: boolean;
    readonly failedKeys: readonly DashboardMetricKey[];
    readonly refetch: () => void;
};

export const useAttendanceTrendQuery: (months: number) => UseQueryResult<AttendanceRatePoint[], Error>;
export const useDepartmentDistributionQuery: () => UseQueryResult<DepartmentShare[], Error>;
export const useRecentActivitiesQuery: (limit: number) => UseQueryResult<RecentActivity[], Error>;
export const useUpcomingEventsQuery: (limit: number) => UseQueryResult<UpcomingEvent[], Error>;
```

### Cấu trúc thư mục

```
frontend/src/
├── components/                StatCard, TrendBadge, SectionCard, ChartLegend, Avatar,
│                              Skeleton, SectionErrorState, EmptyState, PageHeader
├── constants/messages.ts      thêm DASHBOARD_MESSAGES
├── lib/date.ts                formatRelativeTime, formatDate, formatTime (UTC → giờ địa phương)
└── features/dashboard/
    ├── api.ts                 hàm gọi API, unwrap ApiResponse
    ├── types.ts
    ├── hooks/                 useDashboardSummaryQuery, useAttendanceTrendQuery,
    │                          useDepartmentDistributionQuery, useRecentActivitiesQuery,
    │                          useUpcomingEventsQuery
    ├── components/            *Container [SMART], AttendanceTrendChart, DepartmentPieChart,
    │                          StatsGrid, ActivityList, ActivityItem, EventList, EventCard
    └── pages/DashboardPage.tsx
```
