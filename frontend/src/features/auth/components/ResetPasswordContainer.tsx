import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import type { FormFeedback } from "@/components/FormFeedbackBanner";
import { resetPasswordSchema, type ResetPasswordFormValues } from "../schemas";
import { useResetPasswordMutation } from "../hooks/usePasswordMutations";
import type { LoginRedirectReason } from "../types";
import { PasswordChangeForm } from "./PasswordChangeForm";

const REDIRECT_REASON: LoginRedirectReason = "password_reset";

export interface ResetPasswordContainerProps {
    readonly resetToken: string;
}

/** Thành công thì về thẳng trang đăng nhập, thông báo hiển thị ở đó. */
export const ResetPasswordContainer = ({ resetToken }: ResetPasswordContainerProps) => {
    const navigate = useNavigate();
    const [feedback, setFeedback] = useState<FormFeedback | null>(null);
    const resetPasswordMutation = useResetPasswordMutation();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        mode: "onChange",
        defaultValues: { newPassword: "", confirmPassword: "" },
    });

    const onSubmit = handleSubmit(({ newPassword }) => {
        setFeedback(null);
        resetPasswordMutation.mutate(
            { resetToken, newPassword },
            {
                onSuccess: () => navigate(`/login?reason=${REDIRECT_REASON}`, { replace: true }),
                onError: (error) => setFeedback({ type: "error", message: error.message }),
            },
        );
    });

    return (
        <PasswordChangeForm
            mode="reset"
            newPassword={{
                registration: register("newPassword"),
                error: errors.newPassword?.message,
            }}
            confirmPassword={{
                registration: register("confirmPassword"),
                error: errors.confirmPassword?.message,
            }}
            feedback={feedback}
            isSubmitting={resetPasswordMutation.isPending}
            isSubmitDisabled={!isValid}
            submitLabel="Lưu mật khẩu"
            onSubmit={() => void onSubmit()}
        />
    );
};
