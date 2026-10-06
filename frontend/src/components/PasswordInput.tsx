import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";
import { getInputClassName } from "./inputStyles";

export interface PasswordInputProps extends Omit<ComponentProps<"input">, "type"> {
    readonly id: string;
    readonly error?: string;
}

export const PasswordInput = ({
    id,
    error,
    disabled,
    autoComplete = "current-password",
    className,
    ...props
}: PasswordInputProps) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className={cn("relative w-full flex items-center", className)}>
            <input
                id={id}
                type={isVisible ? "text" : "password"}
                disabled={disabled}
                autoComplete={autoComplete}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
                className={getInputClassName(!!error, "pr-11")}
                {...props}
            />
            <button
                type="button"
                onClick={() => setIsVisible((prev) => !prev)}
                disabled={disabled}
                aria-label={isVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-ink rounded outline-none focus-visible:ring-2 focus-visible:ring-primary/30 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isVisible ? (
                    <EyeOff className="w-5 h-5" aria-hidden="true" />
                ) : (
                    <Eye className="w-5 h-5" aria-hidden="true" />
                )}
            </button>
        </div>
    );
};
