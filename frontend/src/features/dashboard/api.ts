import { apiClient } from "@/lib/axios";
import { unwrapData, type ApiResponse } from "@/lib/apiError";
import {
    MOCK_DEPARTMENT_SHARES,
    MOCK_METRICS,
    getMockAttendanceTrend,
    getMockRecentActivities,
    getMockUpcomingEvents,
    withMockDelay,
} from "./mocks";
import type {
    AttendanceRatePoint,
    DashboardMetric,
    DashboardMetricKey,
    DepartmentShare,
    MetricStatisticResponse,
    RecentActivity,
    UpcomingEvent,
} from "./types";

// Các endpoint thống kê chưa có ở backend, bật cờ này trong .env để xem giao diện với dữ liệu mẫu
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";

const METRIC_ENDPOINTS: Record<DashboardMetricKey, string> = {
    totalEmployees: "/api/employees/statistics/summary",
    presentToday: "/api/attendances/statistics/today",
    onLeaveToday: "/api/leave-requests/statistics/today",
    openPositions: "/api/job-postings/statistics/open",
};

export const getDashboardMetricApi = async (key: DashboardMetricKey): Promise<DashboardMetric> => {
    const statistic = USE_MOCK_API
        ? await withMockDelay(MOCK_METRICS[key])
        : unwrapData(
              (await apiClient.get<ApiResponse<MetricStatisticResponse>>(METRIC_ENDPOINTS[key]))
                  .data,
          );

    return {
        key,
        value: statistic.value,
        trend:
            statistic.changePercent === null
                ? null
                : { changePercent: statistic.changePercent, comparedTo: "previous_month" },
    };
};

export const getAttendanceTrendApi = async (months: number): Promise<AttendanceRatePoint[]> => {
    if (USE_MOCK_API) return withMockDelay(getMockAttendanceTrend(months));

    const response = await apiClient.get<ApiResponse<AttendanceRatePoint[]>>(
        "/api/attendances/statistics/monthly-rate",
        { params: { months } },
    );
    return unwrapData(response.data);
};

export const getDepartmentDistributionApi = async (): Promise<DepartmentShare[]> => {
    if (USE_MOCK_API) return withMockDelay(MOCK_DEPARTMENT_SHARES);

    const response = await apiClient.get<ApiResponse<DepartmentShare[]>>(
        "/api/employees/statistics/by-department",
    );
    return unwrapData(response.data);
};

export const getRecentActivitiesApi = async (limit: number): Promise<RecentActivity[]> => {
    if (USE_MOCK_API) return withMockDelay(getMockRecentActivities().slice(0, limit));

    const response = await apiClient.get<ApiResponse<RecentActivity[]>>("/api/activities", {
        params: { limit },
    });
    return unwrapData(response.data);
};

export const getUpcomingEventsApi = async (limit: number): Promise<UpcomingEvent[]> => {
    if (USE_MOCK_API) return withMockDelay(getMockUpcomingEvents().slice(0, limit));

    const response = await apiClient.get<ApiResponse<UpcomingEvent[]>>("/api/events/upcoming", {
        params: { limit },
    });
    return unwrapData(response.data);
};
