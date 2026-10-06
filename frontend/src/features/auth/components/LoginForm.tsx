import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { FormFeedbackBanner } from "@/components/FormFeedbackBanner";
import { FormField } from "@/components/FormField";
import { PasswordInput } from "@/components/PasswordInput";
import { TextInput } from "@/components/TextInput";
import type { LoginFormValues } from "../schemas";
import { AuthLink } from "./AuthLink";

export interface LoginFormProps {
    readonly register: UseFormRegister<LoginFormValues>;
    readonly errors: FieldErrors<LoginFormValues>;
    readonly serverError: string | null;
    readonly isSubmitting: boolean;
    readonly onSubmit: () => void;
    readonly onClearServerError: () => void;
}

export const LoginForm = ({
    register,
    errors,
    serverError,
    isSubmitting,
    onSubmit,
    onClearServerError,
}: LoginFormProps) => (
    <form
        onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
        }}
        className="w-full flex flex-col gap-5"
        noValidate
    >
        <FormFeedbackBanner
            feedback={serverError ? { type: "error", message: serverError } : null}
            onClose={onClearServerError}
        />

        <FormField id="login-email" label="Email" error={errors.email?.message}>
            <TextInput
                id="login-email"
                type="email"
                autoComplete="email"
                disabled={isSubmitting}
                error={errors.email?.message}
                {...register("email")}
            />
        </FormField>

        <FormField id="login-password" label="Mật khẩu" error={errors.password?.message}>
            <PasswordInput
                id="login-password"
                autoComplete="current-password"
                disabled={isSubmitting}
                error={errors.password?.message}
                {...register("password")}
            />
        </FormField>

        <div className="w-full flex items-center justify-between py-1">
            <Checkbox
                id="login-remember-me"
                label="Ghi nhớ đăng nhập"
                disabled={isSubmitting}
                {...register("rememberMe")}
            />
            <AuthLink to="/forgot-password" label="Quên mật khẩu?" disabled={isSubmitting} />
        </div>

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Đăng nhập
        </Button>
    </form>
);
