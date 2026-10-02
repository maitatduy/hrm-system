import { FormFeedbackBanner } from "@/components/FormFeedbackBanner";
import { FormField } from "@/components/FormField";
import { TextInput } from "@/components/TextInput";
import { SubmitButton } from "@/components/SubmitButton";
import { BackToLoginLink } from "./BackToLoginLink";
import type { ForgotPasswordFormProps } from "../types";

export const ForgotPasswordForm = ({
    register,
    errors,
    feedback,
    isSubmitting,
    onSubmit,
    onClearFeedback,
}: ForgotPasswordFormProps) => {
    return (
        <form
            id="forgotPasswordForm"
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
            className="w-full flex flex-col gap-5"
            noValidate
        >
            {feedback && (
                <FormFeedbackBanner
                    type={feedback.type}
                    message={feedback.message}
                    onClose={onClearFeedback}
                />
            )}

            <FormField
                id="email"
                label="Email công việc"
                error={errors.email?.message}
                required
            >
                <TextInput
                    id="email"
                    type="email"
                    placeholder="nguyenvana@hrm.com"
                    autoComplete="email"
                    disabled={isSubmitting}
                    error={errors.email?.message}
                    registration={register("email")}
                />
            </FormField>

            <SubmitButton isLoading={isSubmitting} loadingText="Đang gửi mã...">
                <span>Gửi mã xác thực</span>
            </SubmitButton>

            <div className="text-center pt-1">
                <BackToLoginLink disabled={isSubmitting} />
            </div>
        </form>
    );
};
