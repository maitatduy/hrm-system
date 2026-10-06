export interface OtpResendSectionProps {
    readonly secondsLeft: number;
    readonly isResending: boolean;
    readonly onResend: () => void;
}

const formatCountdown = (seconds: number) =>
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

export const OtpResendSection = ({ secondsLeft, isResending, onResend }: OtpResendSectionProps) => (
    <div className="text-center text-[16px] text-ink-muted select-none">
        {secondsLeft > 0 ? (
            <span>
                Gửi lại mã sau{" "}
                <span className="font-medium tabular-nums">{formatCountdown(secondsLeft)}</span>
            </span>
        ) : (
            <span>
                Bạn chưa nhận được mã?{" "}
                <button
                    type="button"
                    onClick={onResend}
                    disabled={isResending}
                    className="ml-1 text-primary font-medium hover:underline active:text-primary-active cursor-pointer rounded-xs outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isResending ? "Đang gửi lại..." : "Gửi lại mã ngay"}
                </button>
            </span>
        )}
    </div>
);
