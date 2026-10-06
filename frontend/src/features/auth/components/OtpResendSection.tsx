export interface OtpResendSectionProps {
    readonly secondsLeft: number;
    readonly isResending: boolean;
    readonly onResend: () => void;
}

const formatCountdown = (seconds: number) =>
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

export const OtpResendSection = ({ secondsLeft, isResending, onResend }: OtpResendSectionProps) => (
    <button
        type="button"
        onClick={onResend}
        disabled={secondsLeft > 0 || isResending}
        className="self-center text-[15px] font-medium text-primary hover:underline cursor-pointer rounded-xs outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:text-ink-faint disabled:no-underline disabled:cursor-not-allowed"
    >
        {secondsLeft > 0 ? (
            <>
                Gửi lại mã sau <span className="tabular-nums">{formatCountdown(secondsLeft)}</span>
            </>
        ) : (
            "Gửi lại mã"
        )}
    </button>
);
