import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";

export interface PasswordInputProps {
    readonly id: string;
    readonly label?: string;
    readonly placeholder?: string;
    readonly error?: string;
    readonly disabled?: boolean;
    readonly registration?: UseFormRegisterReturn;
    readonly value?: string;
    readonly defaultValue?: string;
    readonly onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    readonly autoComplete?: string;
    readonly className?: string;
}

export const PasswordInput = ({
    id,
    placeholder,
    error,
    disabled = false,
    registration,
    value,
    defaultValue,
    onChange,
    autoComplete = "current-password",
    className = "",
}: PasswordInputProps) => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (!disabled) {
            setIsVisible((prev) => !prev);
        }
    };

    return (
        <div className={`relative w-full flex items-center ${className}`}>
            <input
                id={id}
                type={isVisible ? "text" : "password"}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete={autoComplete}
                value={value}
                defaultValue={defaultValue}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
                className={`w-full h-11 pl-3.5 pr-11 bg-[#ffffff] text-[15px] text-[#000000] placeholder-[#a39e98] rounded-xs border transition-colors outline-none ${
                    error
                        ? "border-[#dc2626] focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626]"
                        : "border-[#e6e6e6] hover:border-[#cccccc] focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]"
                } ${disabled ? "bg-[#f6f5f4] text-[#a39e98] cursor-not-allowed select-none" : ""}`}
                {...registration}
                {...(onChange ? { onChange } : {})}
            />
            <button
                type="button"
                onClick={toggleVisibility}
                disabled={disabled}
                aria-label={isVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#615d59] hover:text-[#000000] rounded focus:outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isVisible ? (
                    <EyeOff className="w-[20px] h-[20px]" aria-hidden="true" />
                ) : (
                    <Eye className="w-[20px] h-[20px]" aria-hidden="true" />
                )}
            </button>
        </div>
    );
};
