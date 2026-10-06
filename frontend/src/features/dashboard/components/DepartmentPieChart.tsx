import { Pie, PieChart, ResponsiveContainer, Sector, type PieSectorShapeProps } from "recharts";
import { DASHBOARD_MESSAGES } from "@/constants/messages";
import { formatNumber } from "@/lib/number";
import type { DepartmentShare } from "../types";
import { CHART_COLORS } from "./chartTheme";

export interface DepartmentPieChartProps {
    readonly shares: readonly DepartmentShare[];
    readonly activeDepartmentId: string | null;
    readonly onActiveChange: (departmentId: string | null) => void;
}

const ACTIVE_OFFSET_PX = 4;
const INACTIVE_OPACITY = 0.35;

export const DepartmentPieChart = ({
    shares,
    activeDepartmentId,
    onActiveChange,
}: DepartmentPieChartProps) => {
    const total = shares.reduce((sum, share) => sum + share.employeeCount, 0);

    const renderSector = ({
        index,
        cx,
        cy,
        innerRadius,
        outerRadius,
        startAngle,
        endAngle,
    }: PieSectorShapeProps) => {
        const share = shares[index];
        const isActive = share?.departmentId === activeDepartmentId;
        const isDimmed = activeDepartmentId !== null && !isActive;

        return (
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + (isActive ? ACTIVE_OFFSET_PX : 0)}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={share?.color}
                stroke={CHART_COLORS.surface}
                strokeWidth={2}
                opacity={isDimmed ? INACTIVE_OPACITY : 1}
                className="transition-opacity outline-none"
            />
        );
    };

    return (
        <div className="relative h-64 w-full sm:w-64 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={[...shares]}
                        dataKey="employeeCount"
                        nameKey="departmentName"
                        innerRadius="62%"
                        outerRadius="92%"
                        startAngle={90}
                        endAngle={-270}
                        shape={renderSector}
                        onMouseEnter={(_, index) =>
                            onActiveChange(shares[index]?.departmentId ?? null)
                        }
                        onMouseLeave={() => onActiveChange(null)}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-ink">{formatNumber(total)}</span>
                <span className="text-[13px] text-ink-muted">
                    {DASHBOARD_MESSAGES.DEPARTMENT_DISTRIBUTION_UNIT}
                </span>
            </div>
        </div>
    );
};
