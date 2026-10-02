import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, evaluatePasswordRequirements } from "../schemas";
import type { ChangePasswordFormData } from "../schemas";
import { useChangePasswordMutation } from "../hooks/useChangePasswordMutation";
import { PasswordChangeForm } from "@/components/PasswordChangeForm";
import type { ChangePasswordContainerProps, PasswordFormFeedback } from "../types";

export const ChangePasswordContainer = ({
    onSuccess,
    onCancel,
}: ChangePasswordContainerProps) => {
    const [feedback, setFeedback] = useState<PasswordFormFeedback | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
        mode: "onChange",
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const changePasswordMutation = useChangePasswordMutation();

    const watchedCurrentPassword = watch("currentPassword") || "";
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
    const hasCurrentPassword = watchedCurrentPassword.trim().length > 0;
    const isDifferentFromCurrent =
        watchedCurrentPassword.length > 0 &&
        watchedNewPassword.length > 0 &&
        watchedCurrentPassword !== watchedNewPassword;

    const isSubmitDisabled =
        !hasCurrentPassword ||
        !allRequirementsMet ||
        !passwordsMatch ||
        !isDifferentFromCurrent ||
        changePasswordMutation.isPending;

    const onSubmit = handleSubmit((data) => {
        setFeedback(null);
        changePasswordMutation.mutate(
            {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword,
            },
            {
                onSuccess: (res) => {
                    reset();
                    setFeedback({
                        type: "success",
                        message:
                            res.message ||
                            "Đổi mật khẩu thành công. Thông tin bảo mật của bạn đã được cập nhật.",
                    });
                    onSuccess?.();
                },
                onError: (err) => {
                    setFeedback({
                        type: "error",
                        message:
                            err.message ||
                            "Mật khẩu hiện tại không chính xác hoặc không hợp lệ. Vui lòng thử lại.",
                    });
                },
            },
        );
    });

    const handleCancel = () => {
        reset();
        setFeedback(null);
        onCancel?.();
    };

    return (
        <PasswordChangeForm
            mode="change"
            registerCurrentPassword={register("currentPassword")}
            registerNewPassword={register("newPassword")}
            registerConfirmPassword={register("confirmPassword")}
            currentPasswordError={errors.currentPassword?.message}
            newPasswordError={errors.newPassword?.message}
            confirmPasswordError={errors.confirmPassword?.message}
            isSubmitDisabled={isSubmitDisabled}
            isSubmitting={changePasswordMutation.isPending}
            feedback={feedback}
            onSubmit={onSubmit}
            onCancel={handleCancel}
            submitButtonText="Cập nhật mật khẩu"
        />
    );
};
