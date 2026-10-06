import type { ComponentProps } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "danger";

export interface ButtonProps extends ComponentProps<"button"> {
    readonly variant?: ButtonVariant;
    readonly isLoading?: boolean;
    readonly loadingText?: string;
}

const VARIANT_CLASS_NAMES: Record<ButtonVariant, string> = {
    primary:
        "h-12 px-5 rounded-full text-[16px] font-semibold text-white bg-primary shadow-sm hover:bg-primary-hover active:bg-primary-active focus-visible:ring-primary focus-visible:ring-offset-2 disabled:bg-hairline disabled:text-ink-faint disabled:shadow-none",
    secondary:
        "h-11 px-5 rounded-md text-[15px] font-medium text-ink bg-surface border border-hairline hover:bg-canvas-soft active:bg-hairline focus-visible:ring-primary/20 disabled:opacity-50",
    danger: "h-11 px-6 rounded-md text-[15px] font-semibold text-white bg-accent-danger shadow-sm hover:bg-accent-danger-hover active:bg-accent-danger-active focus-visible:ring-accent-danger/30 disabled:opacity-60",
};

export const Button = ({
    variant = "primary",
    isLoading = false,
    loadingText = "Đang xử lý...",
    type = "button",
    disabled,
    className,
    children,
    ...props
}: ButtonProps) => (
    <button
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(
            "flex items-center justify-center gap-2 select-none cursor-pointer transition-all active:scale-[0.99] outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:active:scale-100",
            VARIANT_CLASS_NAMES[variant],
            className,
        )}
        {...props}
    >
        {isLoading ? (
            <>
                <Loader2 className="w-[18px] h-[18px] animate-spin" aria-hidden="true" />
                <span>{loadingText}</span>
            </>
        ) : (
            children
        )}
    </button>
);
