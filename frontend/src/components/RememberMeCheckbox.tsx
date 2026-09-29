import type { UseFormRegisterReturn } from "react-hook-form";

export interface RememberMeCheckboxProps {
    readonly id: string;
    readonly label: string;
    readonly disabled?: boolean;
    readonly registration?: UseFormRegisterReturn;
    readonly checked?: boolean;
    readonly onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    readonly className?: string;
}

export const RememberMeCheckbox = ({
    id,
    label,
    disabled = false,
    registration,
    checked,
    onChange,
    className = "",
}: RememberMeCheckboxProps) => {
    return (
        <label
            htmlFor={id}
            className={`flex items-center gap-2 cursor-pointer select-none ${disabled ? "cursor-not-allowed opacity-60" : ""} ${className}`}
        >
            <input
                id={id}
                type="checkbox"
                disabled={disabled}
                checked={checked}
                className="w-[18px] h-[18px] rounded-xs border-[#e6e6e6] text-[#0075de] accent-[#0075de] focus:ring-1 focus:ring-[#0075de] focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed transition-all"
                {...registration}
                {...(onChange ? { onChange } : {})}
            />
            <span className="text-[15px] text-[#31302e] font-normal leading-none">{label}</span>
        </label>
    );
};
