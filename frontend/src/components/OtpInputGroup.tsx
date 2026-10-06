import type { ClipboardEvent, KeyboardEvent } from "react";
import { cn } from "@/lib/cn";

export interface OtpInputGroupProps {
    readonly digits: readonly string[];
    readonly activeIndex: number;
    readonly disabled?: boolean;
    readonly isError?: boolean;
    readonly onDigitChange: (index: number, value: string) => void;
    readonly onKeyDown: (index: number, event: KeyboardEvent<HTMLInputElement>) => void;
    readonly onPaste: (event: ClipboardEvent<HTMLInputElement>) => void;
    readonly onFocus: (index: number) => void;
    readonly registerInputRef: (index: number, element: HTMLInputElement | null) => void;
    readonly className?: string;
}

export const OtpInputGroup = ({
    digits,
    activeIndex,
    disabled = false,
    isError = false,
    onDigitChange,
    onKeyDown,
    onPaste,
    onFocus,
    registerInputRef,
    className,
}: OtpInputGroupProps) => (
    <div
        role="group"
        aria-label={`Nhập mã xác thực OTP ${digits.length} số`}
        className={cn("flex items-center justify-center gap-2.5 sm:gap-3 my-2", className)}
    >
        {digits.map((digit, index) => (
            <input
                // Số ô OTP cố định, index là định danh ổn định cho từng ô
                key={index}
                ref={(element) => registerInputRef(index, element)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                disabled={disabled}
                autoComplete={index === 0 ? "one-time-code" : "off"}
                aria-label={`Chữ số thứ ${index + 1}`}
                aria-invalid={isError}
                onFocus={() => onFocus(index)}
                onChange={(event) => onDigitChange(index, event.target.value)}
                onKeyDown={(event) => onKeyDown(index, event)}
                onPaste={onPaste}
                className={cn(
                    "w-12 h-14 p-0 bg-surface border rounded-xs text-center text-[22px] font-semibold text-ink outline-none transition-all",
                    "disabled:bg-canvas-soft disabled:text-ink-faint disabled:cursor-not-allowed",
                    isError
                        ? "border-accent-danger text-accent-danger ring-2 ring-accent-danger/20"
                        : activeIndex === index
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-hairline hover:border-hairline-strong",
                )}
            />
        ))}
    </div>
);
