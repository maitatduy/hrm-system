import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FormFeedback } from "@/components/FormFeedbackBanner";
import { resetPasswordSchema, type ResetPasswordFormValues } from "../schemas";
import { useResetPasswordMutation } from "../hooks/usePasswordMutations";
import { useDelayedNavigate } from "../hooks/useDelayedNavigate";
import type { LoginRedirectReason } from "../types";
import { PasswordChangeForm } from "./PasswordChangeForm";

const REDIRECT_DELAY_MS = 1500;
const REDIRECT_REASON: LoginRedirectReason = "password_reset";

export interface ResetPasswordContainerProps {
    readonly resetToken: string;
}

export const ResetPasswordContainer = ({ resetToken }: ResetPasswordContainerProps) => {
    const [feedback, setFeedback] = useState<FormFeedback | null>(null);
    const resetPasswordMutation = useResetPasswordMutation();
    const navigateLater = useDelayedNavigate(REDIRECT_DELAY_MS);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isValid },
    } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        mode: "onChange",
        defaultValues: { newPassword: "", confirmPassword: "" },
    });
    const newPasswordValue = useWatch({ control, name: "newPassword" });
    const isDone = resetPasswordMutation.isSuccess;

    const onSubmit = handleSubmit(({ newPassword }) => {
        setFeedback(null);
        resetPasswordMutation.mutate(
            { resetToken, newPassword },
            {
                onSuccess: () => {
                    setFeedback({
                        type: "success",
                        message:
                            "Đặt lại mật khẩu thành công. Đang chuyển hướng về trang đăng nhập...",
                    });
                    navigateLater(`/login?reason=${REDIRECT_REASON}`, { replace: true });
                },
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
            newPasswordValue={newPasswordValue}
            feedback={feedback}
            isSubmitting={resetPasswordMutation.isPending || isDone}
            isSubmitDisabled={!isValid}
            submitLabel="Lưu mật khẩu mới"
            onSubmit={() => void onSubmit()}
        />
    );
};
