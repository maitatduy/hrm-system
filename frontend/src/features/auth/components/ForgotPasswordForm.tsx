import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Button } from "@/components/Button";
import { FormFeedbackBanner, type FormFeedback } from "@/components/FormFeedbackBanner";
import { FormField } from "@/components/FormField";
import { TextInput } from "@/components/TextInput";
import type { ForgotPasswordFormValues } from "../schemas";
import { BackToLoginLink } from "./AuthLink";

export interface ForgotPasswordFormProps {
    readonly register: UseFormRegister<ForgotPasswordFormValues>;
    readonly errors: FieldErrors<ForgotPasswordFormValues>;
    readonly feedback: FormFeedback | null;
    readonly isSubmitting: boolean;
    /** Đã gửi mã thành công và đang chờ chuyển sang bước nhập OTP. */
    readonly isRedirecting: boolean;
    readonly onSubmit: () => void;
    readonly onClearFeedback: () => void;
}

export const ForgotPasswordForm = ({
    register,
    errors,
    feedback,
    isSubmitting,
    isRedirecting,
    onSubmit,
    onClearFeedback,
}: ForgotPasswordFormProps) => (
    <form
        onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
        }}
        className="w-full flex flex-col gap-5"
        noValidate
    >
        <FormFeedbackBanner feedback={feedback} onClose={onClearFeedback} />

        <FormField id="forgot-email" label="Email công việc" error={errors.email?.message} required>
            <TextInput
                id="forgot-email"
                type="email"
                placeholder="nguyenvana@hrm.com"
                autoComplete="email"
                disabled={isSubmitting || isRedirecting}
                error={errors.email?.message}
                {...register("email")}
            />
        </FormField>

        <Button
            type="submit"
            className="w-full"
            isLoading={isSubmitting || isRedirecting}
            loadingText={isRedirecting ? "Đang chuyển sang bước xác thực..." : "Đang gửi mã..."}
        >
            Gửi mã xác thực
        </Button>

        <BackToLoginLink disabled={isSubmitting || isRedirecting} />
    </form>
);
