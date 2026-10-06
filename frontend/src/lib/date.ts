// Backend luôn trả thời gian dạng ISO 8601 UTC, chỉ đổi sang giờ địa phương ở các hàm dưới đây
const LOCALE = "vi-VN";

const DATE_FORMATTER = new Intl.DateTimeFormat(LOCALE, {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
});

const TIME_FORMATTER = new Intl.DateTimeFormat(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
});

const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat(LOCALE, { numeric: "always" });

const RELATIVE_TIME_UNITS: readonly [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 365 * 24 * 60 * 60],
    ["month", 30 * 24 * 60 * 60],
    ["day", 24 * 60 * 60],
    ["hour", 60 * 60],
    ["minute", 60],
];

const toDate = (value: string | Date): Date => (value instanceof Date ? value : new Date(value));

/** Ví dụ "Thứ Hai, 12/10/2026". */
export const formatDate = (value: string | Date): string => DATE_FORMATTER.format(toDate(value));

/** Ví dụ "09:00". */
export const formatTime = (value: string | Date): string => TIME_FORMATTER.format(toDate(value));

/** Ví dụ "5 phút trước", dưới một phút hiển thị "Vừa xong". */
export const formatRelativeTime = (value: string | Date, now: Date = new Date()): string => {
    const diffSeconds = Math.round((toDate(value).getTime() - now.getTime()) / 1000);
    const absSeconds = Math.abs(diffSeconds);

    for (const [unit, unitSeconds] of RELATIVE_TIME_UNITS) {
        if (absSeconds >= unitSeconds) {
            return RELATIVE_TIME_FORMATTER.format(Math.trunc(diffSeconds / unitSeconds), unit);
        }
    }
    return "Vừa xong";
};

/** Thứ viết tắt kiểu Việt Nam: "CN", "T2" đến "T7". */
export const formatWeekdayShort = (value: string | Date): string => {
    const weekday = toDate(value).getDay();
    return weekday === 0 ? "CN" : `T${weekday + 1}`;
};

/** Tháng dạng "YYYY-MM" thành nhãn trục "T10". */
export const formatMonthShort = (month: string): string => `T${Number(month.slice(5, 7))}`;

/** Tháng dạng "YYYY-MM" thành "Tháng 10/2026". */
export const formatMonthLong = (month: string): string =>
    `Tháng ${Number(month.slice(5, 7))}/${month.slice(0, 4)}`;
