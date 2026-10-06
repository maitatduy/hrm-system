import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";

export interface AuthLinkProps {
    readonly to: string;
    readonly label: string;
    readonly disabled?: boolean;
    readonly className?: string;
}

/** Link điều hướng giữa các màn hình xác thực, hiển thị dạng chữ mờ khi bị vô hiệu hóa. */
export const AuthLink = ({ to, label, disabled = false, className }: AuthLinkProps) => {
    const baseClassName = "text-[15px] font-medium select-none";

    if (disabled) {
        return (
            <span
                aria-disabled="true"
                className={cn(baseClassName, "text-ink-faint cursor-not-allowed", className)}
            >
                {label}
            </span>
        );
    }

    return (
        <Link
            to={to}
            className={cn(
                baseClassName,
                "text-primary hover:underline active:text-primary-active rounded-xs outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                className,
            )}
        >
            {label}
        </Link>
    );
};

export const BackToLoginLink = ({ disabled }: { readonly disabled?: boolean }) => (
    <div className="text-center pt-1">
        <AuthLink to="/login" label="Quay lại đăng nhập" disabled={disabled} />
    </div>
);
