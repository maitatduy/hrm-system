import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

export interface SubmitButtonProps {
    readonly children: ReactNode;
    readonly isLoading: boolean;
    readonly disabled?: boolean;
    readonly className?: string;
    readonly onClick?: () => void;
}

export const SubmitButton = ({
    children,
    isLoading,
    disabled = false,
    className = "",
    onClick,
}: SubmitButtonProps) => {
    const isDisabled = disabled || isLoading;

    return (
        <button
            type="submit"
            disabled={isDisabled}
            onClick={onClick}
            className={`w-full h-12 px-5 flex items-center justify-center gap-2 text-white text-[16px] font-semibold rounded-full shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0075de] focus:ring-offset-2 select-none ${
                isDisabled
                    ? "bg-[#e6e6e6] text-[#a39e98] cursor-not-allowed shadow-none"
                    : "bg-[#0075de] hover:bg-[#0060b8] active:bg-[#005bab] active:scale-[0.99] cursor-pointer"
            } ${className}`}
        >
            {isLoading ? (
                <>
                    <Loader2
                        className="w-[18px] h-[18px] animate-spin text-white"
                        aria-hidden="true"
                    />
                    <span>Đang đăng nhập...</span>
                </>
            ) : (
                children
            )}
        </button>
    );
};
