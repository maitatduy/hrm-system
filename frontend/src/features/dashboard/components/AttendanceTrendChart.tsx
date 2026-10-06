import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    type TooltipContentProps,
} from "recharts";
import { formatMonthLong, formatMonthShort } from "@/lib/date";
import { formatPercent } from "@/lib/number";
import type { AttendanceRatePoint } from "../types";
import { CHART_AXIS_TICK, CHART_COLORS, CHART_TOOLTIP_CLASS_NAME } from "./chartTheme";

export interface AttendanceTrendChartProps {
    readonly points: readonly AttendanceRatePoint[];
    readonly height?: number;
}

const Y_AXIS_TICKS = [0, 25, 50, 75, 100];

const AttendanceTooltip = ({ active, payload }: TooltipContentProps) => {
    const point = payload?.[0]?.payload as AttendanceRatePoint | undefined;
    if (!active || !point) return null;

    return (
        <div className={CHART_TOOLTIP_CLASS_NAME}>
            <p className="text-[13px] text-ink-muted">{formatMonthLong(point.month)}</p>
            <p className="text-[15px] font-semibold text-ink">{formatPercent(point.rate)}</p>
        </div>
    );
};

export const AttendanceTrendChart = ({ points, height = 288 }: AttendanceTrendChartProps) => (
    <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={[...points]} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={CHART_COLORS.hairline} strokeDasharray="4 4" />
            <XAxis
                dataKey="month"
                tickFormatter={formatMonthShort}
                tick={CHART_AXIS_TICK}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
            />
            <YAxis
                domain={[0, 100]}
                ticks={Y_AXIS_TICKS}
                tickFormatter={(value: number) => `${value}%`}
                tick={CHART_AXIS_TICK}
                axisLine={false}
                tickLine={false}
                width={44}
            />
            <Tooltip content={AttendanceTooltip} cursor={{ stroke: CHART_COLORS.hairline }} />
            <Area
                type="monotone"
                dataKey="rate"
                stroke={CHART_COLORS.primary}
                strokeWidth={2}
                fill={CHART_COLORS.primary}
                fillOpacity={0.08}
                dot={{
                    r: 4,
                    fill: CHART_COLORS.primary,
                    stroke: CHART_COLORS.surface,
                    strokeWidth: 2,
                }}
                activeDot={{
                    r: 6,
                    fill: CHART_COLORS.primary,
                    stroke: CHART_COLORS.surface,
                    strokeWidth: 2,
                }}
            />
        </AreaChart>
    </ResponsiveContainer>
);
