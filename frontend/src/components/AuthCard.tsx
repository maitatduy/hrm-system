import type { ReactNode } from "react";

export interface AuthCardProps {
    readonly children: ReactNode;
    readonly className?: string;
}

export const AuthCard = ({ children, className = "" }: AuthCardProps) => {
    return (
        <div
            className={`relative z-10 w-full max-w-[480px] bg-[#ffffff] border border-[#e6e6e6] rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-7 md:p-9 flex flex-col gap-6 transition-all ${className}`}
        >
            {children}
        </div>
    );
};
