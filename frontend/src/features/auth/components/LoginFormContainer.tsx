import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginFormSchema, type LoginFormValues } from "../schemas";
import { useLoginMutation } from "../hooks/useLoginMutation";
import { LoginForm } from "./LoginForm";

/** Sau khi đăng nhập thành công, GuestRoute tự điều hướng tới ?redirect hoặc trang chủ theo vai trò. */
export const LoginFormContainer = () => {
    const [serverError, setServerError] = useState<string | null>(null);
    const loginMutation = useLoginMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: { email: "", password: "", rememberMe: true },
    });

    const onSubmit = handleSubmit((values) => {
        setServerError(null);
        loginMutation.mutate(values, {
            onError: (error) => setServerError(error.message),
        });
    });

    return (
        <LoginForm
            register={register}
            errors={errors}
            serverError={serverError}
            isSubmitting={loginMutation.isPending}
            onSubmit={() => void onSubmit()}
            onClearServerError={() => setServerError(null)}
        />
    );
};
