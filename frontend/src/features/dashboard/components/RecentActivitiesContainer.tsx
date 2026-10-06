import { EmptyState } from "@/components/EmptyState";
import { SectionCard } from "@/components/SectionCard";
import { SectionErrorState } from "@/components/SectionErrorState";
import { Skeleton } from "@/components/Skeleton";
import { DASHBOARD_MESSAGES } from "@/constants/messages";
import { formatRelativeTime } from "@/lib/date";
import { useRecentActivitiesQuery } from "../hooks/useRecentActivitiesQuery";
import { ActivityList } from "./ActivityList";

const ACTIVITY_LIMIT = 10;
const SKELETON_ROWS = 6;

export interface RecentActivitiesContainerProps {
    readonly className?: string;
}

export const RecentActivitiesContainer = ({ className }: RecentActivitiesContainerProps) => {
    const { data, isPending, isError, isFetching, refetch, dataUpdatedAt } =
        useRecentActivitiesQuery(ACTIVITY_LIMIT);

    const renderBody = () => {
        if (isPending) {
            return (
                <ul className="divide-y divide-hairline">
                    {Array.from({ length: SKELETON_ROWS }, (_, index) => (
                        <li key={index} className="flex items-center gap-3 py-3">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="flex-1 flex flex-col gap-1.5">
                                <Skeleton className="h-4 w-3/5" />
                                <Skeleton className="h-3.5 w-24" />
                            </div>
                        </li>
                    ))}
                </ul>
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
        if (data.length === 0) return <EmptyState message={DASHBOARD_MESSAGES.EMPTY_ACTIVITIES} />;

        // Mốc so sánh là lúc dữ liệu về, thời gian tương đối được tính lại sau mỗi lần làm mới định kỳ
        const now = new Date(dataUpdatedAt);
        return (
            <ActivityList
                activities={data}
                getRelativeTime={(occurredAt) => formatRelativeTime(occurredAt, now)}
            />
        );
    };

    return (
        <SectionCard title={DASHBOARD_MESSAGES.RECENT_ACTIVITIES_TITLE} className={className}>
            {renderBody()}
        </SectionCard>
    );
};
