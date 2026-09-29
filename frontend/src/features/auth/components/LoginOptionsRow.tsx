import { RememberMeCheckbox } from "@/components/RememberMeCheckbox";
import { ForgotPasswordLink } from "./ForgotPasswordLink";
import type { UseFormRegisterReturn } from "react-hook-form";

interface LoginOptionsRowProps {
    readonly registration?: UseFormRegisterReturn;
    readonly disabled?: boolean;
    readonly className?: string;
}

export const LoginOptionsRow = ({
    registration,
    disabled = false,
    className = "",
}: LoginOptionsRowProps) => {
    return (
        <div className={`w-full flex items-center justify-between pt-1 pb-1 ${className}`}>
            <RememberMeCheckbox
                id="rememberMe"
                label="Ghi nhớ đăng nhập"
                disabled={disabled}
                registration={registration}
            />
            <ForgotPasswordLink />
        </div>
    );
};
