import { cn } from "@/lib/cn";

/** Style dùng chung cho TextInput và PasswordInput để hai ô nhập luôn đồng nhất. */
export const getInputClassName = (hasError: boolean, className?: string): string =>
    cn(
        "w-full h-11 px-3.5 bg-surface text-[15px] text-ink placeholder-ink-faint rounded-xs border outline-none transition-colors focus:ring-1",
        "disabled:bg-canvas-soft disabled:text-ink-faint disabled:cursor-not-allowed",
        hasError
            ? "border-accent-danger focus:border-accent-danger focus:ring-accent-danger"
            : "border-hairline hover:border-hairline-strong focus:border-primary focus:ring-primary",
        className,
    );
