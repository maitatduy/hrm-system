import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { forgotPasswordFormSchema } from "../schemas";
import { useForgotPasswordMutation } from "../hooks/useForgotPasswordMutation";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import type { ForgotPasswordFormData, FormFeedbackState } from "../types";

export const ForgotPasswordFormContainer = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [feedback, setFeedback] = useState<FormFeedbackState | null>(null);

    const forgotPasswordMutation = useForgotPasswordMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordFormSchema),
        defaultValues: {
            email: searchParams.get("email") || "",
        },
    });

    const onSubmit = (formData: ForgotPasswordFormData) => {
        setFeedback(null);

        forgotPasswordMutation.mutate(
            {
                email: formData.email,
            },
            {
                onSuccess: (response) => {
                    const message =
                        response.message ||
                        "Nếu email tồn tại trong hệ thống, mã xác thực OTP đã được gửi đến hòm thư của bạn. Vui lòng kiểm tra hộp thư đến (kể cả hòm thư rác/spam).";

                    setFeedback({
                        type: "success",
                        message,
                    });

                    setTimeout(() => {
                        navigate(
                            `/verify-otp?email=${encodeURIComponent(formData.email.trim())}`,
                        );
                    }, 2000);
                },
                onError: (error) => {
                    setFeedback({
                        type: "error",
                        message:
                            error.message ||
                            "Không thể gửi mã xác thực. Vui lòng thử lại sau.",
                    });
                },
            },
        );
    };

    return (
        <ForgotPasswordForm
            register={register}
            errors={errors}
            feedback={feedback}
            isSubmitting={forgotPasswordMutation.isPending}
            onSubmit={() => {
                void handleSubmit(onSubmit)();
            }}
            onClearFeedback={() => setFeedback(null)}
        />
    );
};
