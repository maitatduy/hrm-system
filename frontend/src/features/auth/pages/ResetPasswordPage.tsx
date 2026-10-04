import { useSearchParams, Navigate } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { AuthCard } from "@/components/AuthCard";
import { AuthHeader } from "../components/AuthHeader";
import { ResetPasswordContainer } from "../components/ResetPasswordContainer";
import { BackToLoginLink } from "../components/BackToLoginLink";

export const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (!email) {
        return <Navigate to="/forgot-password" replace />;
    }

    if (!token) {
        return <Navigate to={`/verify-otp?email=${encodeURIComponent(email)}`} replace />;
    }

    return (
        <AuthLayout>
            <AuthCard>
                <AuthHeader title="Đặt lại mật khẩu" />
                <ResetPasswordContainer resetToken={token} />
                <div className="pt-2 text-center">
                    <BackToLoginLink to="/login" label="Quay lại trang đăng nhập" />
                </div>
            </AuthCard>
        </AuthLayout>
    );
};

export default ResetPasswordPage;
