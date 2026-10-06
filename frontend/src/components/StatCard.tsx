import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/number";
import { TrendBadge, type TrendBadgeProps } from "./TrendBadge";

export type StatCardTone = "primary" | "green" | "orange" | "neutral";

export interface StatCardProps {
    readonly label: string;
    readonly value: number;
    readonly icon: LucideIcon;
    readonly tone: StatCardTone;
    readonly trend?: TrendBadgeProps;
    readonly valueFormatter?: (value: number) => string;
}

const TONE_CLASS_NAMES: Record<StatCardTone, string> = {
    primary: "bg-primary/10 text-primary",
    green: "bg-accent-green/10 text-accent-green",
    orange: "bg-accent-orange/10 text-accent-orange",
    neutral: "bg-canvas-soft text-ink-secondary",
};

/** Khung thẻ, dùng lại cho trạng thái tải và lỗi để giữ nguyên kích thước. */
export const STAT_CARD_CLASS_NAME = "bg-surface border border-hairline rounded-lg p-6 shadow-xs";

export const StatCard = ({
    label,
    value,
    icon: Icon,
    tone,
    trend,
    valueFormatter = formatNumber,
}: StatCardProps) => (
    <div className={cn(STAT_CARD_CLASS_NAME, "flex items-start justify-between gap-4")}>
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
            <span className="text-[14px] font-medium text-ink-muted">{label}</span>
            <span className="text-3xl font-bold text-ink">{valueFormatter(value)}</span>
            {trend && <TrendBadge {...trend} />}
        </div>
        <div
            className={cn(
                "w-11 h-11 shrink-0 rounded-md flex items-center justify-center",
                TONE_CLASS_NAMES[tone],
            )}
        >
            <Icon className="w-[22px] h-[22px]" aria-hidden="true" />
        </div>
    </div>
);
