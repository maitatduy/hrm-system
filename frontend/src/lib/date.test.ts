import { describe, expect, it } from "vitest";
import { formatMonthLong, formatMonthShort, formatRelativeTime, formatWeekdayShort } from "./date";

describe("formatRelativeTime", () => {
    const now = new Date("2026-10-12T08:00:00Z");

    it.each([
        ["2026-10-12T07:59:30Z", "Vừa xong"],
        ["2026-10-12T07:55:00Z", "5 phút trước"],
        ["2026-10-12T06:00:00Z", "2 giờ trước"],
        ["2026-10-10T08:00:00Z", "2 ngày trước"],
    ])("formats %s as %s", (occurredAt, expected) => {
        expect(formatRelativeTime(occurredAt, now)).toBe(expected);
    });
});

describe("formatWeekdayShort", () => {
    it("uses CN for Sunday and T2 to T7 for other days", () => {
        expect(formatWeekdayShort(new Date(2026, 9, 11))).toBe("CN");
        expect(formatWeekdayShort(new Date(2026, 9, 12))).toBe("T2");
        expect(formatWeekdayShort(new Date(2026, 9, 17))).toBe("T7");
    });
});

describe("month labels", () => {
    it("formats YYYY-MM for chart axis and tooltip", () => {
        expect(formatMonthShort("2026-05")).toBe("T5");
        expect(formatMonthLong("2026-10")).toBe("Tháng 10/2026");
    });
});
