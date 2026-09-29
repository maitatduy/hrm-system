import type { ReactNode } from "react";

interface AuthTitleProps {
    readonly children?: ReactNode;
    readonly className?: string;
}

export const AuthTitle = ({ children = "Đăng nhập", className = "" }: AuthTitleProps) => {
    return (
        <h1
            className={`text-[26px] md:text-[28px] leading-tight font-bold text-[#000000] text-center tracking-tight ${className}`}
        >
            {children}
        </h1>
    );
};
