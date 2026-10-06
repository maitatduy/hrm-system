import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "react-router-dom";
import type { FormFeedback } from "@/components/FormFeedbackBanner";
import { forgotPasswordFormSchema, type ForgotPasswordFormValues } from "../schemas";
import { useForgotPasswordMutation } from "../hooks/usePasswordMutations";
import { useDelayedNavigate } from "../hooks/useDelayedNavigate";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

const REDIRECT_DELAY_MS = 2000;

export const ForgotPasswordFormContainer = () => {
    const [searchParams] = useSearchParams();
    const [feedback, setFeedback] = useState<FormFeedback | null>(null);
    const forgotPasswordMutation = useForgotPasswordMutation();
    const navigateLater = useDelayedNavigate(REDIRECT_DELAY_MS);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordFormSchema),
        defaultValues: { email: searchParams.get("email") ?? "" },
    });

    const onSubmit = handleSubmit(({ email }) => {
        setFeedback(null);
        forgotPasswordMutation.mutate(
            { email },
            {
                onSuccess: (response) => {
                    setFeedback({ type: "success", message: response.message });
                    navigateLater(`/verify-otp?email=${encodeURIComponent(email)}`);
                },
                onError: (error) => setFeedback({ type: "error", message: error.message }),
            },
        );
    });

    return (
        <ForgotPasswordForm
            register={register}
            errors={errors}
            feedback={feedback}
            isSubmitting={forgotPasswordMutation.isPending}
            // Khóa form trong lúc chờ chuyển trang để tránh gửi lại OTP liên tục
            isRedirecting={forgotPasswordMutation.isSuccess}
            onSubmit={() => void onSubmit()}
            onClearFeedback={() => setFeedback(null)}
        />
    );
};
