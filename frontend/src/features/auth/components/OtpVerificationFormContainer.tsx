import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { FormFeedback } from "@/components/FormFeedbackBanner";
import { useOtpInput } from "../hooks/useOtpInput";
import { useCountdown } from "../hooks/useCountdown";
import { useForgotPasswordMutation, useVerifyOtpMutation } from "../hooks/usePasswordMutations";
import type { ResetPasswordLocationState } from "../types";
import { OtpVerificationForm } from "./OtpVerificationForm";

const OTP_LENGTH = 6;
/** Khớp với thời gian chờ gửi lại OTP ở auth-service. */
const RESEND_COOLDOWN_SECONDS = 60;

export interface OtpVerificationFormContainerProps {
    readonly email: string;
}

export const OtpVerificationFormContainer = ({ email }: OtpVerificationFormContainerProps) => {
    const navigate = useNavigate();
    const [feedback, setFeedback] = useState<FormFeedback | null>(null);
    const otp = useOtpInput(OTP_LENGTH);
    const resendCountdown = useCountdown(RESEND_COOLDOWN_SECONDS);
    const verifyOtpMutation = useVerifyOtpMutation();
    const resendOtpMutation = useForgotPasswordMutation();

    const { focusSlot } = otp;
    useEffect(() => {
        focusSlot(0);
    }, [focusSlot]);

    const handleSubmit = () => {
        if (!otp.isComplete) {
            setFeedback({
                type: "error",
                message: `Vui lòng nhập đủ ${OTP_LENGTH} chữ số mã xác thực.`,
            });
            return;
        }

        setFeedback(null);
        verifyOtpMutation.mutate(
            { email, otp: otp.code },
            {
                // Truyền reset token qua history state thay vì URL để không lưu vào lịch sử trình duyệt
                onSuccess: ({ resetToken }) =>
                    navigate("/reset-password", {
                        replace: true,
                        state: { email, resetToken } satisfies ResetPasswordLocationState,
                    }),
                onError: (error) => setFeedback({ type: "error", message: error.message }),
            },
        );
    };

    const handleResend = () => {
        setFeedback(null);
        resendOtpMutation.mutate(
            { email },
            {
                onSuccess: () => {
                    resendCountdown.restart();
                    otp.reset();
                    setFeedback({
                        type: "success",
                        message: "Mã xác thực mới đã được gửi tới email của bạn.",
                    });
                },
                onError: (error) => setFeedback({ type: "error", message: error.message }),
            },
        );
    };

    return (
        <OtpVerificationForm
            otpInput={{
                digits: otp.digits,
                activeIndex: otp.activeIndex,
                onDigitChange: (index, value) => {
                    setFeedback(null);
                    otp.handleDigitChange(index, value);
                },
                onKeyDown: otp.handleKeyDown,
                onPaste: (event) => {
                    setFeedback(null);
                    otp.handlePaste(event);
                },
                onFocus: otp.handleFocus,
                registerInputRef: otp.registerInputRef,
            }}
            feedback={feedback}
            isSubmitting={verifyOtpMutation.isPending}
            isResending={resendOtpMutation.isPending}
            resendSecondsLeft={resendCountdown.secondsLeft}
            onSubmit={handleSubmit}
            onResend={handleResend}
            onClearFeedback={() => setFeedback(null)}
        />
    );
};
