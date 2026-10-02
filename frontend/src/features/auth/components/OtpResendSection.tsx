import type { OtpResendSectionProps } from "../types";

export const OtpResendSection = ({
    cooldown,
    isResending,
    onResend,
    className = "",
}: OtpResendSectionProps) => {
    const formattedSeconds = cooldown < 10 ? `0${cooldown}` : `${cooldown}`;

    return (
        <div className={`text-center text-[16px] text-[#615d59] font-normal select-none ${className}`}>
            {cooldown > 0 ? (
                <span>
                    Gửi lại mã sau{" "}
                    <span className="font-medium tabular-nums text-[#615d59]">
                        00:{formattedSeconds}
                    </span>
                </span>
            ) : (
                <span>
                    Bạn chưa nhận được mã?{" "}
                    <button
                        type="button"
                        onClick={onResend}
                        disabled={isResending}
                        className="text-[#0075de] text-[16px] font-medium hover:underline active:text-[#005bab] ml-1 cursor-pointer bg-transparent border-0 p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isResending ? "Đang gửi lại..." : "Gửi lại mã ngay"}
                    </button>
                </span>
            )}
        </div>
    );
};
