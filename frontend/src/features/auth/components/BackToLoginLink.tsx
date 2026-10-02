import { Link } from "react-router-dom";
import type { BackToLoginLinkProps } from "../types";

export const BackToLoginLink = ({
    to = "/login",
    label = "Quay lại đăng nhập",
    disabled = false,
    className = "",
}: BackToLoginLinkProps) => {
    if (disabled) {
        return (
            <span
                className={`text-[15px] font-medium text-[#a39e98] cursor-not-allowed select-none ${className}`}
            >
                {label}
            </span>
        );
    }

    return (
        <Link
            to={to}
            className={`text-[15px] font-medium text-[#0075de] hover:underline active:text-[#005bab] transition-colors select-none ${className}`}
        >
            {label}
        </Link>
    );
};
