import type { ReactNode } from "react";

export interface DangerButtonProps {
    readonly children: ReactNode;
    readonly onClick?: () => void;
    readonly isLoading?: boolean;
    readonly disabled?: boolean;
    readonly className?: string;
    readonly type?: "button" | "submit" | "reset";
}

export const DangerButton = ({
    children,
    onClick,
    isLoading = false,
    disabled = false,
    className = "",
    type = "button",
}: DangerButtonProps) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`h-11 px-6 bg-[#dc2626] hover:bg-[#b91c1c] active:bg-[#991b1b] active:scale-[0.99] text-white rounded-md font-semibold text-[15px] shadow-sm flex items-center justify-center gap-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-[#dc2626]/30 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${className}`}
        >
            {isLoading ? (
                <>
                    <svg
                        className="animate-spin -ml-1 mr-2 h-4.5 w-4.5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    <span>Đang xử lý...</span>
                </>
            ) : (
                children
            )}
        </button>
    );
};

export default DangerButton;
