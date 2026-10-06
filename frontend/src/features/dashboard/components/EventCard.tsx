import { cn } from "@/lib/cn";
import type { EventType, UpcomingEvent } from "../types";

export interface EventCardProps {
    readonly event: UpcomingEvent;
    readonly dayLabel: string; // "T2"
    readonly dateLabel: string; // ngày trong tháng, ví dụ "12"
    readonly timeLabel: string; // "09:00 - 10:30"
}

const EVENT_TYPE_BADGES: Record<EventType, { readonly label: string; readonly className: string }> =
    {
        MEETING: { label: "Họp", className: "bg-primary/10 text-primary" },
        INTERVIEW: { label: "Phỏng vấn", className: "bg-avatar text-avatar-ink" },
        TRAINING: { label: "Đào tạo", className: "bg-canvas-soft text-ink-secondary" },
        HOLIDAY: { label: "Ngày nghỉ", className: "bg-accent-green/10 text-accent-green" },
        BIRTHDAY: { label: "Sinh nhật", className: "bg-accent-orange/10 text-accent-orange" },
    };

export const EventCard = ({ event, dayLabel, dateLabel, timeLabel }: EventCardProps) => {
    const badge = EVENT_TYPE_BADGES[event.type];

    return (
        <li className="flex items-center gap-3.5 p-3 border border-hairline rounded-md transition-colors hover:bg-canvas-soft">
            <time
                dateTime={event.startsAt}
                className="w-12 h-12 shrink-0 rounded-md bg-canvas-soft flex flex-col items-center justify-center"
            >
                <span className="text-[11px] font-semibold text-ink-muted uppercase leading-none">
                    {dayLabel}
                </span>
                <span className="text-[18px] font-bold text-ink leading-tight">{dateLabel}</span>
            </time>
            <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-ink truncate">{event.title}</p>
                <p className="text-[13px] text-ink-muted">{timeLabel}</p>
            </div>
            <span
                className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium whitespace-nowrap",
                    badge.className,
                )}
            >
                {badge.label}
            </span>
        </li>
    );
};
