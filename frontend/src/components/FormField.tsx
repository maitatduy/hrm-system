import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface FormFieldProps {
    /** Phải trùng với id của ô nhập bên trong để label và thông báo lỗi liên kết đúng. */
    readonly id: string;
    readonly label: string;
    readonly error?: string;
    readonly required?: boolean;
    readonly className?: string;
    readonly children: ReactNode;
}

export const FormField = ({
    id,
    label,
    error,
    required = false,
    className,
    children,
}: FormFieldProps) => (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
        <label htmlFor={id} className="block text-[15px] font-medium text-ink select-none">
            {label}
            {required && <span className="text-accent-danger ml-0.5">*</span>}
        </label>
        {children}
        {error && (
            <span id={`${id}-error`} role="alert" className="text-[13px] text-accent-danger mt-0.5">
                {error}
            </span>
        )}
    </div>
);
