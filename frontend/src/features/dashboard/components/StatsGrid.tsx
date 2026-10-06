import { STAT_CARD_CLASS_NAME, StatCard, type StatCardProps } from "@/components/StatCard";
import { Skeleton } from "@/components/Skeleton";
import { DASHBOARD_MESSAGES } from "@/constants/messages";
import { cn } from "@/lib/cn";
import type { DashboardMetricKey } from "../types";

export type StatsGridItem =
    | { readonly key: DashboardMetricKey; readonly status: "loading" }
    | { readonly key: DashboardMetricKey; readonly status: "error"; readonly label: string }
    | { readonly key: DashboardMetricKey; readonly status: "ready"; readonly card: StatCardProps };

export interface StatsGridProps {
    readonly items: readonly StatsGridItem[];
    readonly onRetry: () => void;
}

const StatCardSkeleton = () => (
    <div className={cn(STAT_CARD_CLASS_NAME, "flex items-start justify-between gap-4")}>
        <div className="flex flex-col gap-1.5 flex-1">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="w-11 h-11" />
    </div>
);

const StatCardError = ({
    label,
    onRetry,
}: {
    readonly label: string;
    readonly onRetry: () => void;
}) => (
    <div role="alert" className={cn(STAT_CARD_CLASS_NAME, "flex flex-col gap-1.5")}>
        <span className="text-[14px] font-medium text-ink-muted">{label}</span>
        <span className="text-[13px] text-ink-muted">{DASHBOARD_MESSAGES.LOAD_FAILED}</span>
        <button
            type="button"
            onClick={onRetry}
            className="self-start text-[14px] font-medium text-primary hover:underline active:text-primary-active cursor-pointer outline-none focus-visible:underline"
        >
            {DASHBOARD_MESSAGES.RETRY}
        </button>
    </div>
);

export const StatsGrid = ({ items, onRetry }: StatsGridProps) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => {
            if (item.status === "loading") return <StatCardSkeleton key={item.key} />;
            if (item.status === "error") {
                return <StatCardError key={item.key} label={item.label} onRetry={onRetry} />;
            }
            return <StatCard key={item.key} {...item.card} />;
        })}
    </div>
);
