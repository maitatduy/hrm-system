import type { UseFormRegisterReturn } from "react-hook-form";
import { Button } from "@/components/Button";
import { FormFeedbackBanner, type FormFeedback } from "@/components/FormFeedbackBanner";
import { FormField } from "@/components/FormField";
import { PasswordInput } from "@/components/PasswordInput";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";

interface PasswordFieldProps {
    readonly registration: UseFormRegisterReturn;
    readonly error?: string;
}

export interface PasswordChangeFormProps {
    /** "reset": đặt lại mật khẩu từ OTP, "change": đổi mật khẩu khi đã đăng nhập (cần mật khẩu hiện tại). */
    readonly mode: "reset" | "change";
    readonly currentPassword?: PasswordFieldProps;
    readonly newPassword: PasswordFieldProps;
    readonly confirmPassword: PasswordFieldProps;
    /** Giá trị đang nhập của mật khẩu mới, dùng để hiển thị các yêu cầu đã đạt. */
    readonly newPasswordValue: string;
    readonly feedback: FormFeedback | null;
    readonly isSubmitting: boolean;
    readonly isSubmitDisabled: boolean;
    readonly submitLabel: string;
    readonly onSubmit: () => void;
    readonly onCancel?: () => void;
}

export const PasswordChangeForm = ({
    mode,
    currentPassword,
    newPassword,
    confirmPassword,
    newPasswordValue,
    feedback,
    isSubmitting,
    isSubmitDisabled,
    submitLabel,
    onSubmit,
    onCancel,
}: PasswordChangeFormProps) => (
    <form
        onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
        }}
        noValidate
        className="w-full flex flex-col gap-4"
    >
        <FormFeedbackBanner feedback={feedback} />

        {mode === "change" && currentPassword && (
            <FormField
                id="current-password"
                label="Mật khẩu hiện tại"
                required
                error={currentPassword.error}
            >
                <PasswordInput
                    id="current-password"
                    placeholder="Nhập mật khẩu bạn đang sử dụng"
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    error={currentPassword.error}
                    {...currentPassword.registration}
                />
            </FormField>
        )}

        <FormField id="new-password" label="Mật khẩu mới" required error={newPassword.error}>
            <PasswordInput
                id="new-password"
                placeholder={
                    mode === "change"
                        ? "Nhập mật khẩu mới cần thay đổi"
                        : "Nhập mật khẩu mới của bạn"
                }
                autoComplete="new-password"
                disabled={isSubmitting}
                error={newPassword.error}
                {...newPassword.registration}
            />
            <PasswordStrengthIndicator password={newPasswordValue} className="mt-1" />
        </FormField>

        <FormField
            id="confirm-password"
            label="Xác nhận mật khẩu mới"
            required
            error={confirmPassword.error}
        >
            <PasswordInput
                id="confirm-password"
                placeholder="Nhập lại mật khẩu mới"
                autoComplete="new-password"
                disabled={isSubmitting}
                error={confirmPassword.error}
                {...confirmPassword.registration}
            />
        </FormField>

        {mode === "reset" ? (
            <Button
                type="submit"
                className="w-full mt-2"
                isLoading={isSubmitting}
                disabled={isSubmitDisabled}
            >
                {submitLabel}
            </Button>
        ) : (
            <div className="pt-4 border-t border-hairline flex items-center justify-end gap-3 w-full">
                {onCancel && (
                    <Button
                        variant="secondary"
                        className="h-10"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Hủy bỏ
                    </Button>
                )}
                <Button
                    type="submit"
                    className="h-10 px-6"
                    isLoading={isSubmitting}
                    disabled={isSubmitDisabled}
                >
                    {submitLabel}
                </Button>
            </div>
        )}
    </form>
);
