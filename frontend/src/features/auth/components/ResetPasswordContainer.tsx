import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { resetPasswordSchema, evaluatePasswordRequirements } from "../schemas";
import type { ResetPasswordFormData } from "../schemas";
import { useResetPasswordMutation } from "../hooks/useResetPasswordMutation";
import { PasswordChangeForm } from "@/components/PasswordChangeForm";
import type { ResetPasswordContainerProps, PasswordFormFeedback } from "../types";

export const ResetPasswordContainer = ({
    resetToken,
    onSuccessRedirect,
}: ResetPasswordContainerProps) => {
    const navigate = useNavigate();
    const [feedback, setFeedback] = useState<PasswordFormFeedback | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        mode: "onChange",
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    });

    const resetPasswordMutation = useResetPasswordMutation();

    const watchedNewPassword = watch("newPassword") || "";
    const watchedConfirmPassword = watch("confirmPassword") || "";

    const requirements = useMemo(
        () => evaluatePasswordRequirements(watchedNewPassword),
        [watchedNewPassword],
    );

    const allRequirementsMet = requirements.every((r) => r.isMet);
    const passwordsMatch =
        watchedNewPassword.length > 0 &&
        watchedConfirmPassword.length > 0 &&
        watchedNewPassword === watchedConfirmPassword;

    const isSubmitDisabled =
        !watchedNewPassword ||
        !watchedConfirmPassword ||
        !passwordsMatch ||
        !allRequirementsMet ||
        resetPasswordMutation.isPending;

    const onSubmit = handleSubmit((data) => {
        setFeedback(null);
        resetPasswordMutation.mutate(
            {
                resetToken,
                newPassword: data.newPassword,
            },
            {
                onSuccess: (res) => {
                    setFeedback({
                        type: "success",
                        message:
                            res.message ||
                            "Đặt lại mật khẩu thành công. Đang chuyển hướng về trang đăng nhập...",
                    });
                    setTimeout(() => {
                        if (onSuccessRedirect) {
                            onSuccessRedirect("/login?reset=success");
                        } else {
                            navigate("/login?reset=success");
                        }
                    }, 1500);
                },
                onError: (err) => {
                    setFeedback({
                        type: "error",
                        message:
                            err.message ||
                            "Phiên đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. Vui lòng gửi lại yêu cầu OTP.",
                    });
                },
            },
        );
    });

    return (
        <PasswordChangeForm
            mode="reset"
            registerNewPassword={register("newPassword")}
            registerConfirmPassword={register("confirmPassword")}
            newPasswordError={errors.newPassword?.message}
            confirmPasswordError={errors.confirmPassword?.message}
            isSubmitDisabled={isSubmitDisabled}
            isSubmitting={resetPasswordMutation.isPending}
            feedback={feedback}
            onSubmit={onSubmit}
            submitButtonText="Lưu mật khẩu mới"
        />
    );
};
