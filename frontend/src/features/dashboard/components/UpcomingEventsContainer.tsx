import { EmptyState } from "@/components/EmptyState";
import { SectionCard } from "@/components/SectionCard";
import { SectionErrorState } from "@/components/SectionErrorState";
import { Skeleton } from "@/components/Skeleton";
import { DASHBOARD_MESSAGES } from "@/constants/messages";
import { formatTime, formatWeekdayShort } from "@/lib/date";
import { useUpcomingEventsQuery } from "../hooks/useUpcomingEventsQuery";
import type { EventType, UpcomingEvent } from "../types";
import type { EventCardProps } from "./EventCard";
import { EventList } from "./EventList";

const EVENT_LIMIT = 5;

// Các loại sự kiện kéo dài trọn ngày, không hiển thị giờ
const ALL_DAY_EVENT_TYPES: readonly EventType[] = ["HOLIDAY", "BIRTHDAY"];

const formatEventTime = (event: UpcomingEvent): string => {
    if (ALL_DAY_EVENT_TYPES.includes(event.type)) return DASHBOARD_MESSAGES.ALL_DAY;
    const start = formatTime(event.startsAt);
    return event.endsAt ? `${start} - ${formatTime(event.endsAt)}` : start;
};

const toEventCardProps = (event: UpcomingEvent): EventCardProps => ({
    event,
    dayLabel: formatWeekdayShort(event.startsAt),
    dateLabel: String(new Date(event.startsAt).getDate()),
    timeLabel: formatEventTime(event),
});

export const UpcomingEventsContainer = () => {
    const { data, isPending, isError, isFetching, refetch } = useUpcomingEventsQuery(EVENT_LIMIT);

    const renderBody = () => {
        if (isPending) {
            return (
                <div className="flex flex-col gap-3">
                    {Array.from({ length: EVENT_LIMIT }, (_, index) => (
                        <Skeleton key={index} className="h-[74px] w-full" />
                    ))}
                </div>
            );
        }
        if (isError) {
            return (
                <SectionErrorState
                    message={DASHBOARD_MESSAGES.LOAD_FAILED}
                    onRetry={() => void refetch()}
                    isRetrying={isFetching}
                />
            );
        }
        if (data.length === 0) return <EmptyState message={DASHBOARD_MESSAGES.EMPTY_EVENTS} />;
        return <EventList events={data.map(toEventCardProps)} />;
    };

    return (
        <SectionCard title={DASHBOARD_MESSAGES.UPCOMING_EVENTS_TITLE}>{renderBody()}</SectionCard>
    );
};
