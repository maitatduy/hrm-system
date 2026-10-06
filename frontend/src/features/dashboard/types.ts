/** Chiều tăng giảm so với tháng trước, giá trị phần trăm đã làm tròn 1 chữ số thập phân. */
export interface MetricTrend {
    readonly changePercent: number;
    readonly comparedTo: "previous_month";
}

export type DashboardMetricKey =
    "totalEmployees" | "presentToday" | "onLeaveToday" | "openPositions";

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
    "CHECKED_IN" | "LEAVE_REQUESTED" | "LEAVE_APPROVED" | "EMPLOYEE_JOINED" | "PROFILE_UPDATED";

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

/** Body của các endpoint thống kê đơn lẻ, ví dụ GET /api/employees/statistics/summary. */
export interface MetricStatisticResponse {
    readonly value: number;
    readonly changePercent: number | null;
}
