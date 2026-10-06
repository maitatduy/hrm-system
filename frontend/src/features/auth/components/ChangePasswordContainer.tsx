import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FormFeedback } from "@/components/FormFeedbackBanner";
import { changePasswordSchema, type ChangePasswordFormValues } from "../schemas";
import { useChangePasswordMutation } from "../hooks/usePasswordMutations";
import { useLogoutMutation } from "../hooks/useLogoutMutation";
import { PasswordChangeForm } from "./PasswordChangeForm";

/**
 * Backend thu hồi mọi refresh token sau khi đổi mật khẩu, nên phiên hiện tại sẽ hết hạn sớm.
 * Vì vậy đăng xuất ngay và yêu cầu đăng nhập lại bằng mật khẩu mới thay vì để phiên tự rơi.
 */
export const ChangePasswordContainer = () => {
    const [feedback, setFeedback] = useState<FormFeedback | null>(null);
    const changePasswordMutation = useChangePasswordMutation();
    const logoutMutation = useLogoutMutation("password_changed");

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(changePasswordSchema),
        mode: "onChange",
        defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    });

    const onSubmit = handleSubmit(({ currentPassword, newPassword }) => {
        setFeedback(null);
        changePasswordMutation.mutate(
            { currentPassword, newPassword },
            {
                onSuccess: () => logoutMutation.mutate(),
                onError: (error) => setFeedback({ type: "error", message: error.message }),
            },
        );
    });

    const isSubmitting = changePasswordMutation.isPending || logoutMutation.isPending;

    return (
        <PasswordChangeForm
            mode="change"
            currentPassword={{
                registration: register("currentPassword"),
                error: errors.currentPassword?.message,
            }}
            newPassword={{
                registration: register("newPassword"),
                error: errors.newPassword?.message,
            }}
            confirmPassword={{
                registration: register("confirmPassword"),
                error: errors.confirmPassword?.message,
            }}
            feedback={feedback}
            isSubmitting={isSubmitting}
            isSubmitDisabled={!isValid}
            submitLabel="Đổi mật khẩu"
            onSubmit={() => void onSubmit()}
        />
    );
};
