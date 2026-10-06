import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { FormFeedback } from "@/components/FormFeedbackBanner";
import { forgotPasswordFormSchema, type ForgotPasswordFormValues } from "../schemas";
import { useForgotPasswordMutation } from "../hooks/usePasswordMutations";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

/** Gửi mã thành công thì chuyển thẳng sang bước nhập OTP, không hiện thông báo trung gian. */
export const ForgotPasswordFormContainer = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [feedback, setFeedback] = useState<FormFeedback | null>(null);
    const forgotPasswordMutation = useForgotPasswordMutation();

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
                onSuccess: () => navigate(`/verify-otp?email=${encodeURIComponent(email)}`),
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
            onSubmit={() => void onSubmit()}
            onClearFeedback={() => setFeedback(null)}
        />
    );
};
