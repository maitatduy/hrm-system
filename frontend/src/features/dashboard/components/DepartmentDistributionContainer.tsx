import { Suspense, lazy, useState } from "react";
import { ChartLegend } from "@/components/ChartLegend";
import { EmptyState } from "@/components/EmptyState";
import { SectionCard } from "@/components/SectionCard";
import { SectionErrorState } from "@/components/SectionErrorState";
import { Skeleton } from "@/components/Skeleton";
import { DASHBOARD_MESSAGES } from "@/constants/messages";
import { useDepartmentDistributionQuery } from "../hooks/useDepartmentDistributionQuery";

const DepartmentPieChart = lazy(() =>
    import("./DepartmentPieChart").then((module) => ({ default: module.DepartmentPieChart })),
);

const PieSkeleton = () => <Skeleton className="h-64 w-full sm:w-64 shrink-0 rounded-full" />;

export const DepartmentDistributionContainer = () => {
    const { data, isPending, isError, isFetching, refetch } = useDepartmentDistributionQuery();
    // Đồng bộ trạng thái nổi bật giữa lát biểu đồ và dòng chú thích
    const [activeDepartmentId, setActiveDepartmentId] = useState<string | null>(null);

    const renderBody = () => {
        if (isPending) {
            return (
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <PieSkeleton />
                    <div className="flex flex-col gap-2 w-full">
                        {Array.from({ length: 6 }, (_, index) => (
                            <Skeleton key={index} className="h-8 w-full" />
                        ))}
                    </div>
                </div>
            );
        }
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
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <Suspense fallback={<PieSkeleton />}>
                    <DepartmentPieChart
                        shares={data}
                        activeDepartmentId={activeDepartmentId}
                        onActiveChange={setActiveDepartmentId}
                    />
                </Suspense>
                <ChartLegend
                    items={data.map((share) => ({
                        id: share.departmentId,
                        label: share.departmentName,
                        value: share.employeeCount,
                        color: share.color,
                    }))}
                    activeId={activeDepartmentId}
                    onHover={setActiveDepartmentId}
                />
            </div>
        );
    };

    return (
        <SectionCard title={DASHBOARD_MESSAGES.DEPARTMENT_DISTRIBUTION_TITLE}>
            {renderBody()}
        </SectionCard>
    );
};
