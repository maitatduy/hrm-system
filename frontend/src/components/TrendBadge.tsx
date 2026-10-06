import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatPercent } from "@/lib/number";

export interface TrendBadgeProps {
    readonly changePercent: number;
    /** false với chỉ số mà tăng là xấu, ví dụ số người nghỉ phép. */
    readonly isPositiveGood?: boolean;
    readonly caption?: string; // mặc định "so với tháng trước"
}

/** Màu theo ý nghĩa tốt hay xấu của thay đổi, không theo dấu của con số. */
export const TrendBadge = ({
    changePercent,
    isPositiveGood = true,
    caption = "so với tháng trước",
}: TrendBadgeProps) => {
    const isUnchanged = changePercent === 0;
    const isGood = changePercent > 0 === isPositiveGood;
    const Icon = isUnchanged ? Minus : changePercent > 0 ? TrendingUp : TrendingDown;

    return (
        <span className="inline-flex flex-wrap items-center gap-x-1 text-[13px]">
            <span
                className={cn(
                    "inline-flex items-center gap-1 font-semibold",
                    isUnchanged
                        ? "text-ink-muted"
                        : isGood
                          ? "text-accent-green"
                          : "text-accent-danger",
                )}
            >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                {formatPercent(Math.abs(changePercent))}
            </span>
            <span className="text-ink-faint whitespace-nowrap">{caption}</span>
        </span>
    );
};
