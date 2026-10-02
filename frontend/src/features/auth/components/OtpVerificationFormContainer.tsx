import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useVerifyOtpMutation } from "../hooks/useVerifyOtpMutation";
import { useResendOtpMutation } from "../hooks/useResendOtpMutation";
import { OtpVerificationForm } from "./OtpVerificationForm";
import type { OtpFeedbackState } from "../types";

interface OtpVerificationFormContainerProps {
    readonly email: string;
}

export const OtpVerificationFormContainer = ({ email }: OtpVerificationFormContainerProps) => {
    const navigate = useNavigate();
    const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
    const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);
    const [cooldown, setCooldown] = useState<number>(60);
    const [feedback, setFeedback] = useState<OtpFeedbackState | null>(null);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const verifyOtpMutation = useVerifyOtpMutation();
    const resendOtpMutation = useResendOtpMutation();

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (cooldown <= 0) return;

        const timer = setInterval(() => {
            setCooldown((prev) => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [cooldown]);

    const registerInputRef = (index: number, el: HTMLInputElement | null) => {
        inputRefs.current[index] = el;
    };

    const handleOtpChange = (index: number, rawVal: string) => {
        setFeedback(null);
        const char = rawVal.slice(-1);

        if (char && !/^\d$/.test(char)) {
            return;
        }

        const newDigits = [...otpDigits];
        newDigits[index] = char;
        setOtpDigits(newDigits);

        if (char && index < 5) {
            inputRefs.current[index + 1]?.focus();
            setActiveSlotIndex(index + 1);
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (!otpDigits[index] && index > 0) {
                const newDigits = [...otpDigits];
                newDigits[index - 1] = "";
                setOtpDigits(newDigits);
                inputRefs.current[index - 1]?.focus();
                setActiveSlotIndex(index - 1);
            } else {
                const newDigits = [...otpDigits];
                newDigits[index] = "";
                setOtpDigits(newDigits);
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
            setActiveSlotIndex(index - 1);
        } else if (e.key === "ArrowRight" && index < 5) {
            inputRefs.current[index + 1]?.focus();
            setActiveSlotIndex(index + 1);
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        setFeedback(null);

        const pastedData = e.clipboardData.getData("text");
        const digits = pastedData.replace(/\D/g, "").slice(0, 6);

        if (!digits) return;

        const newDigits = ["", "", "", "", "", ""];
        for (let i = 0; i < digits.length; i++) {
            newDigits[i] = digits[i];
        }
        setOtpDigits(newDigits);

        const nextFocusIndex = Math.min(digits.length, 5);
        inputRefs.current[nextFocusIndex]?.focus();
        setActiveSlotIndex(nextFocusIndex);
    };

    const handleOtpFocus = (index: number) => {
        setActiveSlotIndex(index);
    };

    const handleSubmit = () => {
        setFeedback(null);
        const otpCode = otpDigits.join("");

        if (otpCode.length < 6) {
            setFeedback({
                type: "error",
                message: "Vui lòng nhập đủ 6 chữ số mã xác thực.",
            });
            return;
        }

        verifyOtpMutation.mutate(
            {
                email,
                otp: otpCode,
            },
            {
                onSuccess: (res) => {
                    const tokenParam = res.resetToken ? `&token=${encodeURIComponent(res.resetToken)}` : "";
                    navigate(`/reset-password?email=${encodeURIComponent(email)}${tokenParam}`);
                },
                onError: (err) => {
                    setFeedback({
                        type: "error",
                        message: err.message || "Mã xác thực không chính xác hoặc đã hết hiệu lực. Vui lòng kiểm tra lại.",
                    });
                },
            },
        );
    };

    const handleResend = () => {
        if (cooldown > 0) return;
        setFeedback(null);

        resendOtpMutation.mutate(
            { email },
            {
                onSuccess: (res) => {
                    setCooldown(60);
                    setOtpDigits(["", "", "", "", "", ""]);
                    inputRefs.current[0]?.focus();
                    setActiveSlotIndex(0);
                    setFeedback({
                        type: "success",
                        message: res.message || "Mã xác thực mới đã được gửi tới email của bạn.",
                    });
                },
                onError: (err) => {
                    setFeedback({
                        type: "error",
                        message: err.message || "Không thể gửi lại mã xác thực. Vui lòng thử lại sau.",
                    });
                },
            },
        );
    };

    return (
        <OtpVerificationForm
            otpDigits={otpDigits}
            activeSlotIndex={activeSlotIndex}
            feedback={feedback}
            isSubmitting={verifyOtpMutation.isPending}
            isResending={resendOtpMutation.isPending}
            cooldown={cooldown}
            onOtpChange={handleOtpChange}
            onOtpKeyDown={handleOtpKeyDown}
            onOtpPaste={handleOtpPaste}
            onOtpFocus={handleOtpFocus}
            registerInputRef={registerInputRef}
            onSubmit={handleSubmit}
            onResend={handleResend}
            onClearFeedback={() => setFeedback(null)}
        />
    );
};
