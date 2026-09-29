import { AuthLayout } from "@/components/AuthLayout";
import { AuthCard } from "@/components/AuthCard";
import { AuthHeader } from "../components/AuthHeader";
import { LoginFormContainer } from "../components/LoginFormContainer";

export const LoginPage = () => {
    return (
        <AuthLayout>
            <AuthCard>
                <AuthHeader />
                <LoginFormContainer />
            </AuthCard>
        </AuthLayout>
    );
};

export default LoginPage;
