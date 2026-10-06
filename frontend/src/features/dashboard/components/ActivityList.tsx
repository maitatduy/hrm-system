import type { RecentActivity } from "../types";
import { ActivityItem } from "./ActivityItem";

export interface ActivityListProps {
    readonly activities: readonly RecentActivity[];
    readonly getRelativeTime: (occurredAt: string) => string;
}

export const ActivityList = ({ activities, getRelativeTime }: ActivityListProps) => (
    <ul className="divide-y divide-hairline">
        {activities.map((activity) => (
            <ActivityItem
                key={activity.id}
                activity={activity}
                relativeTime={getRelativeTime(activity.occurredAt)}
            />
        ))}
    </ul>
);
