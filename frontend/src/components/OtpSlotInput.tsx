import type { OtpSlotInputProps } from "@/features/auth/types";

export const OtpSlotInput = ({
    index,
    value,
    disabled = false,
    isError = false,
    isFocused = false,
    onChange,
    onKeyDown,
    onPaste,
    onFocus,
    inputRef,
}: OtpSlotInputProps) => {
    return (
        <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={value}
            disabled={disabled}
            autoComplete="one-time-code"
            aria-label={`Chữ số thứ ${index + 1}`}
            onFocus={() => onFocus(index)}
            onChange={(e) => onChange(index, e.target.value)}
            onKeyDown={(e) => onKeyDown(index, e)}
            onPaste={onPaste}
            className={`w-12 h-14 bg-[#ffffff] border text-center text-[22px] font-semibold rounded-[4px] outline-none transition-all p-0 select-none ${
                isError
                    ? "border-[#dc2626] text-[#dc2626] ring-2 ring-[#dc2626]/20"
                    : isFocused
                      ? "border-[#0075de] text-[#000000] ring-2 ring-[#0075de]/20"
                      : "border-[#e6e6e6] text-[#000000] hover:border-[#cccccc]"
            } ${disabled ? "bg-[#f6f5f4] text-[#a39e98] cursor-not-allowed" : ""}`}
        />
    );
};
