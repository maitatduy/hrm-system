import { Link } from "react-router-dom";

interface ForgotPasswordLinkProps {
    readonly to?: string;
    readonly className?: string;
}

export const ForgotPasswordLink = ({
    to = "/forgot-password",
    className = "",
}: ForgotPasswordLinkProps) => {
    return (
        <Link
            to={to}
            className={`text-[15px] font-medium text-[#0075de] hover:underline active:text-[#005bab] transition-colors ${className}`}
        >
            Quên mật khẩu?
        </Link>
    );
};
