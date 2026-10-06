import type { UseFormRegisterReturn } from "react-hook-form";
import { Button } from "@/components/Button";
import { FormFeedbackBanner, type FormFeedback } from "@/components/FormFeedbackBanner";
import { FormField } from "@/components/FormField";
import { PasswordInput } from "@/components/PasswordInput";

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
    readonly feedback: FormFeedback | null;
    readonly isSubmitting: boolean;
    readonly isSubmitDisabled: boolean;
    readonly submitLabel: string;
    readonly onSubmit: () => void;
}

export const PasswordChangeForm = ({
    mode,
    currentPassword,
    newPassword,
    confirmPassword,
    feedback,
    isSubmitting,
    isSubmitDisabled,
    submitLabel,
    onSubmit,
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
                error={currentPassword.error}
            >
                <PasswordInput
                    id="current-password"
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    error={currentPassword.error}
                    {...currentPassword.registration}
                />
            </FormField>
        )}

        <FormField id="new-password" label="Mật khẩu mới" error={newPassword.error}>
            <PasswordInput
                id="new-password"
                autoComplete="new-password"
                disabled={isSubmitting}
                error={newPassword.error}
                {...newPassword.registration}
            />
        </FormField>

        <FormField id="confirm-password" label="Nhập lại mật khẩu" error={confirmPassword.error}>
            <PasswordInput
                id="confirm-password"
                autoComplete="new-password"
                disabled={isSubmitting}
                error={confirmPassword.error}
                {...confirmPassword.registration}
            />
        </FormField>

        <Button
            type="submit"
            className={mode === "reset" ? "w-full mt-2" : "h-10 px-6 self-end mt-2"}
            isLoading={isSubmitting}
            disabled={isSubmitDisabled}
        >
            {submitLabel}
        </Button>
    </form>
);
