import { Avatar } from "@/components/Avatar";
import type { ActivityAction, RecentActivity } from "../types";

export interface ActivityItemProps {
    readonly activity: RecentActivity;
    /** Đã đổi sang giờ địa phương, ví dụ "5 phút trước". */
    readonly relativeTime: string;
}

const ACTION_LABELS: Record<ActivityAction, string> = {
    CHECKED_IN: "đã chấm công",
    LEAVE_REQUESTED: "gửi đơn nghỉ phép",
    LEAVE_APPROVED: "được duyệt đơn nghỉ phép",
    EMPLOYEE_JOINED: "gia nhập công ty",
    PROFILE_UPDATED: "cập nhật hồ sơ cá nhân",
};

export const ActivityItem = ({ activity, relativeTime }: ActivityItemProps) => (
    <li className="flex items-center gap-3 py-3">
        <Avatar name={activity.employeeName} size="md" />
        <div className="flex-1 min-w-0">
            <p className="text-[14px] text-ink-secondary truncate">
                <span className="font-semibold text-ink">{activity.employeeName}</span>{" "}
                {ACTION_LABELS[activity.action]}
            </p>
            <p className="text-[13px] text-ink-muted truncate">{activity.departmentName}</p>
        </div>
        <time
            dateTime={activity.occurredAt}
            className="text-[13px] text-ink-faint whitespace-nowrap"
        >
            {relativeTime}
        </time>
    </li>
);
