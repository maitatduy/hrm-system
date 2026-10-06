import type { ComponentProps } from "react";
import { getInputClassName } from "./inputStyles";

export interface TextInputProps extends ComponentProps<"input"> {
    readonly id: string;
    readonly error?: string;
}

/** Nhận trực tiếp kết quả của react-hook-form `register()` qua spread props. */
export const TextInput = ({ id, error, type = "text", className, ...props }: TextInputProps) => (
    <input
        id={id}
        type={type}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={getInputClassName(!!error, className)}
        {...props}
    />
);
