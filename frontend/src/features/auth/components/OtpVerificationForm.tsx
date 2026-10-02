import { FormFeedbackBanner } from "@/components/FormFeedbackBanner";
import { OtpInputGroup } from "@/components/OtpInputGroup";
import { SubmitButton } from "@/components/SubmitButton";
import { OtpResendSection } from "./OtpResendSection";
import { BackToLoginLink } from "./BackToLoginLink";
import type { OtpVerificationFormProps } from "../types";

export const OtpVerificationForm = ({
    otpDigits,
    activeSlotIndex,
    feedback,
    isSubmitting,
    isResending,
    cooldown,
    onOtpChange,
    onOtpKeyDown,
    onOtpPaste,
    onOtpFocus,
    registerInputRef,
    onSubmit,
    onResend,
    onClearFeedback,
}: OtpVerificationFormProps) => {
    const isError = feedback?.type === "error";

    return (
        <form
            id="otpVerificationForm"
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
            className="flex flex-col gap-5 w-full"
            noValidate
        >
            {feedback && (
                <FormFeedbackBanner
                    type={feedback.type}
                    message={feedback.message}
                    onClose={onClearFeedback}
                />
            )}

            <OtpInputGroup
                value={otpDigits}
                disabled={isSubmitting}
                isError={isError}
                activeIndex={activeSlotIndex}
                onChange={onOtpChange}
                onKeyDown={onOtpKeyDown}
                onPaste={onOtpPaste}
                onFocus={onOtpFocus}
                registerInputRef={registerInputRef}
            />

            <SubmitButton isLoading={isSubmitting} loadingText="Đang xác thực...">
                <span>Xác nhận mã</span>
            </SubmitButton>

            <OtpResendSection
                cooldown={cooldown}
                isResending={isResending}
                onResend={onResend}
            />

            <div className="text-center pt-1">
                <BackToLoginLink disabled={isSubmitting} />
            </div>
        </form>
    );
};
