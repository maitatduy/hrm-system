import { cn } from "@/lib/cn";
import type { AuthUserSession } from "../types";
import { ROLE_LABELS, getInitialsFromEmail } from "../utils";

export interface UserAvatarProps {
    readonly email?: string;
    readonly className?: string;
}

export const UserAvatar = ({ email, className }: UserAvatarProps) => (
    <div
        aria-hidden="true"
        className={cn(
            "w-10 h-10 shrink-0 rounded-full bg-avatar text-avatar-ink font-bold text-sm flex items-center justify-center",
            className,
        )}
    >
        {getInitialsFromEmail(email)}
    </div>
);

export interface UserIdentityProps {
    readonly user: AuthUserSession | null;
    readonly className?: string;
}

/** Email và vai trò của người dùng, dùng ở header, menu và hộp thoại đăng xuất. */
export const UserIdentity = ({ user, className }: UserIdentityProps) => (
    <div className={cn("flex flex-col text-left min-w-0", className)}>
        <span className="text-[15px] font-semibold text-ink leading-tight truncate">
            {user?.email}
        </span>
        <span className="text-[13px] text-ink-muted leading-tight mt-1 truncate">
            {user ? ROLE_LABELS[user.role] : ""}
        </span>
    </div>
);
