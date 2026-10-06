import { useSearchParams } from "react-router-dom";
import { AuthCard } from "@/components/AuthCard";
import { AuthLayout } from "@/components/AuthLayout";
import { FormFeedbackBanner } from "@/components/FormFeedbackBanner";
import { AuthHeader } from "../components/AuthHeader";
import { LoginFormContainer } from "../components/LoginFormContainer";
import { AUTH_MESSAGES } from "@/constants/messages";
import type { LoginRedirectReason } from "../types";

const REASON_MESSAGES: Record<LoginRedirectReason, string> = {
    logged_out: AUTH_MESSAGES.LOGGED_OUT,
    password_reset: AUTH_MESSAGES.PASSWORD_RESET,
    password_changed: AUTH_MESSAGES.PASSWORD_CHANGED,
};

const isLoginRedirectReason = (value: string | null): value is LoginRedirectReason =>
    value !== null && value in REASON_MESSAGES;

export const LoginPage = () => {
    const [searchParams] = useSearchParams();
    const reason = searchParams.get("reason");

    return (
        <AuthLayout>
            <title>Đăng nhập - HRM System</title>
            <AuthCard>
                <AuthHeader title="Đăng nhập" />
                {isLoginRedirectReason(reason) && (
                    <FormFeedbackBanner
                        feedback={{ type: "success", message: REASON_MESSAGES[reason] }}
                    />
                )}
                <LoginFormContainer />
            </AuthCard>
        </AuthLayout>
    );
};
