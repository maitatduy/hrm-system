import { AuthCard } from "@/components/AuthCard";
import { AuthLayout } from "@/components/AuthLayout";
import { AuthHeader } from "../components/AuthHeader";
import { ForgotPasswordFormContainer } from "../components/ForgotPasswordFormContainer";

export const ForgotPasswordPage = () => (
    <AuthLayout>
        <title>Quên mật khẩu - HRM System</title>
        <AuthCard>
            <AuthHeader
                title="Quên mật khẩu"
                description="Nhập email công việc để nhận mã xác thực đặt lại mật khẩu."
            />
            <ForgotPasswordFormContainer />
        </AuthCard>
    </AuthLayout>
);
