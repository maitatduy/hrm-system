import type {
    AttendanceRatePoint,
    DashboardMetricKey,
    DepartmentShare,
    MetricStatisticResponse,
    RecentActivity,
    UpcomingEvent,
} from "./types";

// Dữ liệu mẫu theo design brief, chỉ dùng khi VITE_USE_MOCK_API=true vì backend chưa có các endpoint thống kê

const MINUTE_MS = 60 * 1000;

const minutesAgo = (minutes: number): string =>
    new Date(Date.now() - minutes * MINUTE_MS).toISOString();

/** Giờ địa phương của ngày cách hôm nay `dayOffset` ngày, trả về ISO UTC như backend. */
const localDateTime = (dayOffset: number, hour: number, minute = 0): string => {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
};

const recentMonths = (count: number): string[] => {
    const now = new Date();
    return Array.from({ length: count }, (_, index) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    });
};

export const MOCK_METRICS: Record<DashboardMetricKey, MetricStatisticResponse> = {
    totalEmployees: { value: 248, changePercent: 3.8 },
    presentToday: { value: 231, changePercent: 1.2 },
    onLeaveToday: { value: 9, changePercent: 12.5 },
    openPositions: { value: 6, changePercent: -14.3 },
};

const MOCK_ATTENDANCE_RATES = [94.1, 95.3, 92.8, 93.6, 95.9, 96.2];

export const getMockAttendanceTrend = (months: number): AttendanceRatePoint[] =>
    recentMonths(months).map((month, index) => ({
        month,
        rate: MOCK_ATTENDANCE_RATES[index % MOCK_ATTENDANCE_RATES.length],
    }));

export const MOCK_DEPARTMENT_SHARES: DepartmentShare[] = [
    {
        departmentId: "engineering",
        departmentName: "Kỹ thuật",
        employeeCount: 86,
        color: "#0075de",
    },
    { departmentId: "sales", departmentName: "Kinh doanh", employeeCount: 54, color: "#1aae39" },
    { departmentId: "marketing", departmentName: "Marketing", employeeCount: 32, color: "#dd5b00" },
    { departmentId: "accounting", departmentName: "Kế toán", employeeCount: 28, color: "#dc2626" },
    { departmentId: "hr", departmentName: "Nhân sự", employeeCount: 18, color: "#31302e" },
    { departmentId: "admin", departmentName: "Hành chính", employeeCount: 30, color: "#a39e98" },
];

export const getMockRecentActivities = (): RecentActivity[] => [
    {
        id: "a1",
        employeeId: "e1",
        employeeName: "Nguyễn Văn An",
        departmentName: "Kỹ thuật",
        action: "CHECKED_IN",
        occurredAt: minutesAgo(5),
    },
    {
        id: "a2",
        employeeId: "e2",
        employeeName: "Trần Thị Bình",
        departmentName: "Kinh doanh",
        action: "LEAVE_REQUESTED",
        occurredAt: minutesAgo(18),
    },
    {
        id: "a3",
        employeeId: "e3",
        employeeName: "Lê Hoàng Cường",
        departmentName: "Kế toán",
        action: "LEAVE_APPROVED",
        occurredAt: minutesAgo(42),
    },
    {
        id: "a4",
        employeeId: "e4",
        employeeName: "Phạm Minh Dũng",
        departmentName: "Kỹ thuật",
        action: "EMPLOYEE_JOINED",
        occurredAt: minutesAgo(65),
    },
    {
        id: "a5",
        employeeId: "e5",
        employeeName: "Hoàng Thu Hà",
        departmentName: "Marketing",
        action: "PROFILE_UPDATED",
        occurredAt: minutesAgo(125),
    },
    {
        id: "a6",
        employeeId: "e6",
        employeeName: "Vũ Quốc Khánh",
        departmentName: "Kỹ thuật",
        action: "CHECKED_IN",
        occurredAt: minutesAgo(185),
    },
];

export const getMockUpcomingEvents = (): UpcomingEvent[] => [
    {
        id: "ev1",
        title: "Họp giao ban phòng Nhân sự",
        type: "MEETING",
        startsAt: localDateTime(1, 9),
        endsAt: localDateTime(1, 10),
    },
    {
        id: "ev2",
        title: "Phỏng vấn ứng viên Kỹ sư Frontend",
        type: "INTERVIEW",
        startsAt: localDateTime(2, 14),
        endsAt: localDateTime(2, 15),
    },
    {
        id: "ev3",
        title: "Đào tạo an toàn thông tin quý IV",
        type: "TRAINING",
        startsAt: localDateTime(3, 8, 30),
        endsAt: localDateTime(3, 11, 30),
    },
    {
        id: "ev4",
        title: "Sinh nhật Trần Thị Bình",
        type: "BIRTHDAY",
        startsAt: localDateTime(4, 0),
        endsAt: null,
    },
    {
        id: "ev5",
        title: "Nghỉ lễ Ngày Phụ nữ Việt Nam",
        type: "HOLIDAY",
        startsAt: localDateTime(8, 0),
        endsAt: null,
    },
];

/** Giả lập độ trễ mạng để thấy được trạng thái skeleton. */
export const withMockDelay = <T>(data: T): Promise<T> =>
    new Promise((resolve) => setTimeout(() => resolve(data), 400));
