import { useMemo } from "react";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/cn";
import { evaluatePasswordRequirements } from "../passwordRules";

export interface PasswordStrengthIndicatorProps {
    readonly password: string;
    readonly className?: string;
}

export const PasswordStrengthIndicator = ({
    password,
    className,
}: PasswordStrengthIndicatorProps) => {
    const requirements = useMemo(() => evaluatePasswordRequirements(password), [password]);

    return (
        <div
            className={cn(
                "w-full bg-canvas-soft/80 p-3 rounded-xs border border-hairline/60 flex flex-col gap-2",
                className,
            )}
        >
            <p className="text-[12px] font-semibold text-ink-secondary tracking-tight">
                Yêu cầu mật khẩu an toàn:
            </p>
            <ul className="flex flex-col gap-1.5">
                {requirements.map(({ id, label, isMet }) => (
                    <li key={id} className="flex items-center gap-2 select-none">
                        {isMet ? (
                            <Check
                                className="w-3.5 h-3.5 text-accent-green stroke-[2.5] shrink-0"
                                aria-hidden="true"
                            />
                        ) : (
                            <Circle
                                className="w-3.5 h-3.5 text-ink-faint stroke-[1.5] shrink-0"
                                aria-hidden="true"
                            />
                        )}
                        <span
                            className={cn(
                                "text-[13px] leading-snug transition-colors",
                                isMet ? "text-accent-green font-medium" : "text-ink-muted",
                            )}
                        >
                            {label}
                            <span className="sr-only">{isMet ? " (đã đạt)" : " (chưa đạt)"}</span>
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};
