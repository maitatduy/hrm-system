import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export interface CheckboxProps extends Omit<ComponentProps<"input">, "type"> {
    readonly id: string;
    readonly label: string;
}

export const Checkbox = ({ id, label, disabled, className, ...props }: CheckboxProps) => (
    <label
        htmlFor={id}
        className={cn(
            "flex items-center gap-2 cursor-pointer select-none",
            disabled && "cursor-not-allowed opacity-60",
            className,
        )}
    >
        <input
            id={id}
            type="checkbox"
            disabled={disabled}
            className="w-[18px] h-[18px] rounded-xs accent-primary cursor-pointer disabled:cursor-not-allowed"
            {...props}
        />
        <span className="text-[15px] text-ink-secondary leading-none">{label}</span>
    </label>
);
