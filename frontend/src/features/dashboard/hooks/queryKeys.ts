import type { DashboardMetricKey } from "../types";

export const DASHBOARD_QUERY_KEYS = {
    all: ["dashboard"] as const,
    summary: (metric: DashboardMetricKey) => ["dashboard", "summary", metric] as const,
    attendanceTrend: (months: number) => ["dashboard", "attendance-trend", { months }] as const,
    departmentDistribution: ["dashboard", "department-distribution"] as const,
    activities: (limit: number) => ["dashboard", "activities", { limit }] as const,
    upcomingEvents: (limit: number) => ["dashboard", "upcoming-events", { limit }] as const,
};
