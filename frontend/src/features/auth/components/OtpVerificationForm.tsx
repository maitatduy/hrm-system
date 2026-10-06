import type { ComponentProps } from "react";
import { Button } from "@/components/Button";
import { FormFeedbackBanner, type FormFeedback } from "@/components/FormFeedbackBanner";
import { OtpInputGroup } from "@/components/OtpInputGroup";
import { BackToLoginLink } from "./AuthLink";
import { OtpResendSection } from "./OtpResendSection";

export interface OtpVerificationFormProps {
    readonly otpInput: Omit<
        ComponentProps<typeof OtpInputGroup>,
        "disabled" | "isError" | "className"
    >;
    readonly feedback: FormFeedback | null;
    readonly isSubmitting: boolean;
    readonly isResending: boolean;
    readonly resendSecondsLeft: number;
    readonly onSubmit: () => void;
    readonly onResend: () => void;
    readonly onClearFeedback: () => void;
}

export const OtpVerificationForm = ({
    otpInput,
    feedback,
    isSubmitting,
    isResending,
    resendSecondsLeft,
    onSubmit,
    onResend,
    onClearFeedback,
}: OtpVerificationFormProps) => (
    <form
        onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
        }}
        className="flex flex-col gap-5 w-full"
        noValidate
    >
        <FormFeedbackBanner feedback={feedback} onClose={onClearFeedback} />

        <OtpInputGroup {...otpInput} disabled={isSubmitting} isError={feedback?.type === "error"} />

        <Button
            type="submit"
            className="w-full"
            isLoading={isSubmitting}
            loadingText="Đang xác thực..."
        >
            Xác nhận mã
        </Button>

        <OtpResendSection
            secondsLeft={resendSecondsLeft}
            isResending={isResending}
            onResend={onResend}
        />

        <BackToLoginLink disabled={isSubmitting} />
    </form>
);
