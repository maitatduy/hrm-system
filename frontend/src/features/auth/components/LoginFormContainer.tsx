import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loginFormSchema } from "../schemas";
import { useLoginMutation } from "../hooks/useLoginMutation";
import { LoginForm } from "./LoginForm";
import { getHomePathByRole, getSafeRedirectPath } from "../roles";
import type { LoginFormData } from "../types";

export const LoginFormContainer = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [serverError, setServerError] = useState<string | null>(null);

    const loginMutation = useLoginMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: true,
        },
    });

    const onSubmit = (formData: LoginFormData) => {
        setServerError(null);

        loginMutation.mutate(
            {
                email: formData.email,
                password: formData.password,
            },
            {
                onSuccess: (response) => {
                    const redirectPath = getSafeRedirectPath(searchParams.get("redirect"));
                    navigate(redirectPath ?? getHomePathByRole(response.user.role), {
                        replace: true,
                    });
                },
                onError: (error) => {
                    setServerError(
                        error.message ||
                            "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.",
                    );
                },
            },
        );
    };

    return (
        <LoginForm
            register={register}
            errors={errors}
            serverError={serverError}
            isSubmitting={loginMutation.isPending}
            onSubmit={() => {
                void handleSubmit(onSubmit)();
            }}
            onClearServerError={() => setServerError(null)}
        />
    );
};
