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
    readonly onSubmit: () => void;
    readonly onClearFeedback: () => void;
}

export const ForgotPasswordForm = ({
    register,
    errors,
    feedback,
    isSubmitting,
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

        <FormField id="forgot-email" label="Email" error={errors.email?.message}>
            <TextInput
                id="forgot-email"
                type="email"
                autoComplete="email"
                disabled={isSubmitting}
                error={errors.email?.message}
                {...register("email")}
            />
        </FormField>

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Gửi mã
        </Button>

        <BackToLoginLink disabled={isSubmitting} />
    </form>
);
