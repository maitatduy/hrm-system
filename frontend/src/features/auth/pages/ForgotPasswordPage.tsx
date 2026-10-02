import { AuthLayout } from "@/components/AuthLayout";
import { AuthCard } from "@/components/AuthCard";
import { AuthHeader } from "../components/AuthHeader";
import { ForgotPasswordFormContainer } from "../components/ForgotPasswordFormContainer";

export const ForgotPasswordPage = () => {
    return (
        <AuthLayout>
            <AuthCard>
                <AuthHeader title="Quên mật khẩu" />
                <ForgotPasswordFormContainer />
            </AuthCard>
        </AuthLayout>
    );
};

export default ForgotPasswordPage;
