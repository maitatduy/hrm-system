import { ArrowRight } from "lucide-react";
import type { LoginFormProps } from "../types";
import { FormErrorMessageBanner } from "@/components/FormErrorMessageBanner";
import { FormField } from "@/components/FormField";
import { TextInput } from "@/components/TextInput";
import { PasswordInput } from "@/components/PasswordInput";
import { SubmitButton } from "@/components/SubmitButton";
import { LoginOptionsRow } from "./LoginOptionsRow";

interface ExtendedLoginFormProps extends LoginFormProps {
    readonly onClearServerError?: () => void;
}

export const LoginForm = ({
    register,
    errors,
    serverError,
    isSubmitting,
    onSubmit,
    onClearServerError,
}: ExtendedLoginFormProps) => {
    return (
        <form
            id="loginForm"
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
            className="w-full flex flex-col gap-5"
            noValidate
        >
            <FormErrorMessageBanner message={serverError} onClose={onClearServerError} />

            <FormField
                id="workEmail"
                label="Email công việc"
                error={errors.email?.message}
                required
            >
                <TextInput
                    id="workEmail"
                    type="email"
                    placeholder="nguyenvana@hrm.com"
                    autoComplete="email"
                    disabled={isSubmitting}
                    error={errors.email?.message}
                    registration={register("email")}
                />
            </FormField>

            <FormField
                id="passwordInput"
                label="Mật khẩu"
                error={errors.password?.message}
                required
            >
                <PasswordInput
                    id="passwordInput"
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    error={errors.password?.message}
                    registration={register("password")}
                />
            </FormField>

            <LoginOptionsRow registration={register("rememberMe")} disabled={isSubmitting} />

            <SubmitButton isLoading={isSubmitting}>
                <span>Đăng nhập</span>
                <ArrowRight className="w-4.5 h-4.5 ml-1.5" aria-hidden="true" />
            </SubmitButton>
        </form>
    );
};
