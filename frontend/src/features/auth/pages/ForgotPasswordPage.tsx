import { AuthCard } from "@/components/AuthCard";
import { AuthLayout } from "@/components/AuthLayout";
import { AuthHeader } from "../components/AuthHeader";
import { ForgotPasswordFormContainer } from "../components/ForgotPasswordFormContainer";

export const ForgotPasswordPage = () => (
    <AuthLayout>
        <title>Quên mật khẩu - HRM System</title>
        <AuthCard>
            <AuthHeader title="Quên mật khẩu" />
            <ForgotPasswordFormContainer />
        </AuthCard>
    </AuthLayout>
);
