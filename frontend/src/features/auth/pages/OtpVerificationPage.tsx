import { Navigate, useSearchParams } from "react-router-dom";
import { AuthCard } from "@/components/AuthCard";
import { AuthLayout } from "@/components/AuthLayout";
import { AuthHeader } from "../components/AuthHeader";
import { OtpVerificationFormContainer } from "../components/OtpVerificationFormContainer";
import { maskEmail } from "../utils";

export const OtpVerificationPage = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email");

    if (!email) {
        return <Navigate to="/forgot-password" replace />;
    }

    return (
        <AuthLayout>
            <title>Nhập mã OTP - HRM System</title>
            <AuthCard>
                <AuthHeader title="Nhập mã OTP" description={`Đã gửi tới ${maskEmail(email)}`} />
                <OtpVerificationFormContainer email={email} />
            </AuthCard>
        </AuthLayout>
    );
};
