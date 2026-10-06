import { EventCard, type EventCardProps } from "./EventCard";

export interface EventListProps {
    readonly events: readonly EventCardProps[];
}

export const EventList = ({ events }: EventListProps) => (
    <ul className="flex flex-col gap-3">
        {events.map((eventCard) => (
            <EventCard key={eventCard.event.id} {...eventCard} />
        ))}
    </ul>
);
