import { cn } from "@/lib/cn";
import { getInitialsFromEmail, getInitialsFromName } from "@/lib/initials";

export interface AvatarProps {
    /** Dùng để lấy chữ cái viết tắt, ưu tiên tên, không có thì dùng email. */
    readonly name?: string;
    readonly email?: string;
    readonly size?: "sm" | "md";
}

const SIZE_CLASS_NAMES: Record<NonNullable<AvatarProps["size"]>, string> = {
    sm: "w-8 h-8 text-[12px]",
    md: "w-10 h-10 text-[14px]",
};

export const Avatar = ({ name, email, size = "md" }: AvatarProps) => (
    <div
        aria-hidden="true"
        className={cn(
            "shrink-0 rounded-full bg-avatar text-avatar-ink font-bold flex items-center justify-center select-none",
            SIZE_CLASS_NAMES[size],
        )}
    >
        {name ? getInitialsFromName(name) : getInitialsFromEmail(email)}
    </div>
);
