import { useSearchParams } from "react-router-dom";
import { AuthCard } from "@/components/AuthCard";
import { AuthLayout } from "@/components/AuthLayout";
import { FormFeedbackBanner } from "@/components/FormFeedbackBanner";
import { AuthHeader } from "../components/AuthHeader";
import { LoginFormContainer } from "../components/LoginFormContainer";
import type { LoginRedirectReason } from "../types";

const REASON_MESSAGES: Record<LoginRedirectReason, string> = {
    logged_out: "Bạn đã đăng xuất khỏi phiên làm việc thành công.",
    password_reset: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.",
    password_changed: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại bằng mật khẩu mới.",
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
