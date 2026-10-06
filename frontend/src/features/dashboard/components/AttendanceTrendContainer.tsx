import { Suspense, lazy } from "react";
import { EmptyState } from "@/components/EmptyState";
import { SectionCard } from "@/components/SectionCard";
import { SectionErrorState } from "@/components/SectionErrorState";
import { Skeleton } from "@/components/Skeleton";
import { DASHBOARD_MESSAGES } from "@/constants/messages";
import { useAttendanceTrendQuery } from "../hooks/useAttendanceTrendQuery";

// Thư viện biểu đồ nặng và chỉ dùng ở dashboard nên tách thành chunk riêng
const AttendanceTrendChart = lazy(() =>
    import("./AttendanceTrendChart").then((module) => ({ default: module.AttendanceTrendChart })),
);

const TREND_MONTHS = 6;

const ChartSkeleton = () => <Skeleton className="w-full h-72" />;

export const AttendanceTrendContainer = () => {
    const { data, isPending, isError, isFetching, refetch } = useAttendanceTrendQuery(TREND_MONTHS);

    const renderBody = () => {
        if (isPending) return <ChartSkeleton />;
        if (isError) {
            return (
                <SectionErrorState
                    message={DASHBOARD_MESSAGES.LOAD_FAILED}
                    onRetry={() => void refetch()}
                    isRetrying={isFetching}
                />
            );
        }
        if (data.length === 0) return <EmptyState message={DASHBOARD_MESSAGES.EMPTY_CHART} />;
        return (
            <Suspense fallback={<ChartSkeleton />}>
                <AttendanceTrendChart points={data} />
            </Suspense>
        );
    };

    return (
        <SectionCard title={DASHBOARD_MESSAGES.ATTENDANCE_TREND_TITLE}>{renderBody()}</SectionCard>
    );
};
