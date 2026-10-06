import { cn } from "@/lib/cn";
import { formatNumber, formatPercent } from "@/lib/number";

export interface ChartLegendItem {
    readonly id: string;
    readonly label: string;
    readonly value: number;
    readonly color: string;
}

export interface ChartLegendProps {
    readonly items: readonly ChartLegendItem[];
    readonly activeId?: string | null;
    readonly onHover?: (id: string | null) => void;
}

/** Chú thích màu kèm giá trị và tỷ trọng, dùng chung cho mọi biểu đồ. */
export const ChartLegend = ({ items, activeId = null, onHover }: ChartLegendProps) => {
    const total = items.reduce((sum, item) => sum + item.value, 0);

    return (
        <ul className="flex flex-col gap-1 w-full" onMouseLeave={() => onHover?.(null)}>
            {items.map((item) => (
                <li
                    key={item.id}
                    onMouseEnter={() => onHover?.(item.id)}
                    className={cn(
                        "flex items-center justify-between gap-3 px-2 py-1.5 rounded-md transition-colors hover:bg-canvas-soft",
                        activeId === item.id && "bg-canvas-soft",
                    )}
                >
                    <span className="flex items-center gap-2 min-w-0">
                        <span
                            aria-hidden="true"
                            className="w-2.5 h-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-[14px] text-ink-secondary truncate">
                            {item.label}
                        </span>
                    </span>
                    <span className="flex items-baseline gap-1.5 shrink-0">
                        <span className="text-[14px] font-semibold text-ink">
                            {formatNumber(item.value)}
                        </span>
                        <span className="text-[13px] text-ink-faint">
                            {formatPercent(total === 0 ? 0 : (item.value / total) * 100)}
                        </span>
                    </span>
                </li>
            ))}
        </ul>
    );
};
