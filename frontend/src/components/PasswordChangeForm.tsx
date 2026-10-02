import { FormField } from "./FormField";
import { PasswordInput } from "./PasswordInput";
import { FormFeedbackBanner } from "./FormFeedbackBanner";
import { SubmitButton } from "./SubmitButton";
import { SecondaryButton } from "./SecondaryButton";
import type { PasswordChangeFormProps } from "@/features/auth/types";

export const PasswordChangeForm = ({
    mode,
    registerCurrentPassword,
    registerNewPassword,
    registerConfirmPassword,
    currentPasswordError,
    newPasswordError,
    confirmPasswordError,
    isSubmitDisabled,
    isSubmitting,
    feedback,
    onSubmit,
    onCancel,
    submitButtonText,
    className = "",
}: PasswordChangeFormProps) => {
    return (
        <form
            onSubmit={onSubmit}
            noValidate
            className={`w-full flex flex-col gap-4 ${className}`}
        >
            {feedback && (
                <FormFeedbackBanner
                    type={feedback.type}
                    message={feedback.message}
                />
            )}

            {mode === "change" && (
                <FormField
                    id="current-password"
                    label="Mật khẩu hiện tại"
                    required
                    error={currentPasswordError}
                >
                    <PasswordInput
                        id="current-password"
                        placeholder="Nhập mật khẩu bạn đang sử dụng"
                        disabled={isSubmitting}
                        error={currentPasswordError}
                        registration={registerCurrentPassword}
                        autoComplete="current-password"
                    />
                </FormField>
            )}

            <FormField
                id="new-password"
                label="Mật khẩu mới"
                required
                error={newPasswordError}
            >
                <PasswordInput
                    id="new-password"
                    placeholder={
                        mode === "change"
                            ? "Nhập mật khẩu mới cần thay đổi"
                            : "Nhập mật khẩu mới của bạn"
                    }
                    disabled={isSubmitting}
                    error={newPasswordError}
                    registration={registerNewPassword}
                    autoComplete="new-password"
                />
            </FormField>

            <FormField
                id="confirm-password"
                label="Xác nhận mật khẩu mới"
                required
                error={confirmPasswordError}
            >
                <PasswordInput
                    id="confirm-password"
                    placeholder="Nhập lại mật khẩu mới"
                    disabled={isSubmitting}
                    error={confirmPasswordError}
                    registration={registerConfirmPassword}
                    autoComplete="new-password"
                />
            </FormField>

            {mode === "reset" ? (
                <div className="pt-2 w-full">
                    <SubmitButton
                        isLoading={isSubmitting}
                        disabled={isSubmitDisabled}
                        className="w-full h-11 md:h-12"
                    >
                        {submitButtonText || "Lưu mật khẩu mới"}
                    </SubmitButton>
                </div>
            ) : (
                <div className="pt-4 border-t border-[#e6e6e6] flex items-center justify-end gap-3 w-full">
                    {onCancel && (
                        <SecondaryButton
                            type="button"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="h-10 px-5"
                        >
                            Hủy bỏ
                        </SecondaryButton>
                    )}
                    <SubmitButton
                        isLoading={isSubmitting}
                        disabled={isSubmitDisabled}
                        className="h-10 px-6"
                    >
                        {submitButtonText || "Cập nhật mật khẩu"}
                    </SubmitButton>
                </div>
            )}
        </form>
    );
};
