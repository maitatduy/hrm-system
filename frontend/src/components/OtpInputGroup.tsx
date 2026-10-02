import { OtpSlotInput } from "./OtpSlotInput";
import type { OtpInputGroupProps } from "@/features/auth/types";

export const OtpInputGroup = ({
    value,
    disabled = false,
    isError = false,
    activeIndex,
    onChange,
    onKeyDown,
    onPaste,
    onFocus,
    registerInputRef,
    className = "",
}: OtpInputGroupProps) => {
    return (
        <div
            role="group"
            aria-label="Nhập mã xác thực OTP 6 số"
            className={`flex items-center justify-center gap-2.5 sm:gap-3 my-2 ${className}`}
        >
            {Array.from({ length: 6 }).map((_, index) => (
                <OtpSlotInput
                    key={index}
                    index={index}
                    value={value[index] || ""}
                    disabled={disabled}
                    isError={isError}
                    isFocused={activeIndex === index}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    onPaste={onPaste}
                    onFocus={onFocus}
                    inputRef={(el) => registerInputRef(index, el)}
                />
            ))}
        </div>
    );
};
