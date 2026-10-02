import type { ReactNode } from "react";

export interface SecondaryButtonProps {
    readonly children: ReactNode;
    readonly onClick?: () => void;
    readonly disabled?: boolean;
    readonly className?: string;
    readonly type?: "button" | "submit" | "reset";
}

export const SecondaryButton = ({
    children,
    onClick,
    disabled = false,
    className = "",
    type = "button",
}: SecondaryButtonProps) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`h-11 px-5 flex items-center justify-center bg-[#ffffff] border border-[#e6e6e6] rounded-md text-[#000000] font-medium text-[15px] hover:bg-[#f6f5f4] active:bg-[#e6e6e6] active:scale-[0.99] transition-all focus:outline-none focus:ring-2 focus:ring-[#0075de]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${className}`}
        >
            {children}
        </button>
    );
};

export default SecondaryButton;
