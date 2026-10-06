import { cn } from "@/lib/cn";
import type { AuthUserSession } from "../types";
import { ROLE_LABELS } from "../utils";

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
