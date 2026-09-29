import type { UseFormRegisterReturn } from "react-hook-form";

export interface TextInputProps {
    readonly id: string;
    readonly label?: string;
    readonly type?: "text" | "email";
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

export const TextInput = ({
    id,
    type = "text",
    placeholder,
    error,
    disabled = false,
    registration,
    value,
    defaultValue,
    onChange,
    autoComplete,
    className = "",
}: TextInputProps) => {
    return (
        <input
            id={id}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete={autoComplete}
            value={value}
            defaultValue={defaultValue}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className={`w-full h-11 px-3.5 bg-[#ffffff] text-[15px] text-[#000000] placeholder-[#a39e98] rounded-xs border transition-colors outline-none ${
                error
                    ? "border-[#dc2626] focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626]"
                    : "border-[#e6e6e6] hover:border-[#cccccc] focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]"
            } ${disabled ? "bg-[#f6f5f4] text-[#a39e98] cursor-not-allowed select-none" : ""} ${className}`}
            {...registration}
            {...(onChange ? { onChange } : {})}
        />
    );
};
