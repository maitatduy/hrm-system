import type { ReactNode } from "react";

interface FormFieldProps {
    readonly id: string;
    readonly label: string;
    readonly error?: string;
    readonly children: ReactNode;
    readonly required?: boolean;
    readonly className?: string;
}

export const FormField = ({
    id,
    label,
    error,
    children,
    required = false,
    className = "",
}: FormFieldProps) => {
    return (
        <div className={`flex flex-col gap-1.5 w-full ${className}`}>
            <label
                htmlFor={id}
                className="block text-[15px] font-medium text-[#000000] select-none"
            >
                {label}
                {required && <span className="text-[#dc2626] ml-0.5">*</span>}
            </label>
            {children}
            {error && (
                <span
                    id={`${id}-error`}
                    role="alert"
                    className="text-[13px] font-normal text-[#dc2626] mt-0.5"
                >
                    {error}
                </span>
            )}
        </div>
    );
};
