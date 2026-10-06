// Recharts vẽ bằng thuộc tính SVG nên cần mã hex, giá trị lấy đúng token trong src/index.css
export const CHART_COLORS = {
    primary: "#0075de",
    surface: "#ffffff",
    hairline: "#e6e6e6",
    inkMuted: "#615d59",
} as const;

export const CHART_AXIS_TICK = { fill: CHART_COLORS.inkMuted, fontSize: 12 } as const;

export const CHART_TOOLTIP_CLASS_NAME =
    "bg-surface border border-hairline rounded-md shadow-[0_8px_28px_rgba(0,0,0,0.1)] px-3 py-2";
