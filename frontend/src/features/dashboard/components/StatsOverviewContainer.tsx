import { Briefcase, CalendarOff, UserCheck, Users, type LucideIcon } from "lucide-react";
import type { StatCardTone } from "@/components/StatCard";
import { DASHBOARD_MESSAGES } from "@/constants/messages";
import { DASHBOARD_METRIC_KEYS, useDashboardSummaryQuery } from "../hooks/useDashboardSummaryQuery";
import type { DashboardMetricKey } from "../types";
import { StatsGrid, type StatsGridItem } from "./StatsGrid";

interface MetricPresentation {
    readonly label: string;
    readonly icon: LucideIcon;
    readonly tone: StatCardTone;
    /** false với chỉ số mà tăng là xấu. */
    readonly isPositiveGood: boolean;
}

const METRIC_PRESENTATIONS: Record<DashboardMetricKey, MetricPresentation> = {
    totalEmployees: {
        label: DASHBOARD_MESSAGES.METRIC_TOTAL_EMPLOYEES,
        icon: Users,
        tone: "primary",
        isPositiveGood: true,
    },
    presentToday: {
        label: DASHBOARD_MESSAGES.METRIC_PRESENT_TODAY,
        icon: UserCheck,
        tone: "green",
        isPositiveGood: true,
    },
    onLeaveToday: {
        label: DASHBOARD_MESSAGES.METRIC_ON_LEAVE_TODAY,
        icon: CalendarOff,
        tone: "orange",
        isPositiveGood: false,
    },
    // Vị trí còn trống giảm nghĩa là đã tuyển được người, nên giảm là tốt
    openPositions: {
        label: DASHBOARD_MESSAGES.METRIC_OPEN_POSITIONS,
        icon: Briefcase,
        tone: "neutral",
        isPositiveGood: false,
    },
};

export const StatsOverviewContainer = () => {
    const { metrics, failedKeys, refetch } = useDashboardSummaryQuery();

    const items = DASHBOARD_METRIC_KEYS.map((key, index): StatsGridItem => {
        const presentation = METRIC_PRESENTATIONS[key];
        const metric = metrics[index];

        // Lần làm mới nền bị lỗi vẫn giữ số liệu cũ, chỉ báo lỗi khi chưa từng có dữ liệu
        if (!metric) {
            return failedKeys.includes(key)
                ? { key, status: "error", label: presentation.label }
                : { key, status: "loading" };
        }

        return {
            key,
            status: "ready",
            card: {
                label: presentation.label,
                value: metric.value,
                icon: presentation.icon,
                tone: presentation.tone,
                trend: metric.trend
                    ? {
                          changePercent: metric.trend.changePercent,
                          isPositiveGood: presentation.isPositiveGood,
                      }
                    : undefined,
            },
        };
    });

    return <StatsGrid items={items} onRetry={refetch} />;
};
