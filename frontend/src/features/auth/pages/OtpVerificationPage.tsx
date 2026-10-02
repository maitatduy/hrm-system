import { useSearchParams, Navigate } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { AuthCard } from "@/components/AuthCard";
import { AuthHeader } from "../components/AuthHeader";
import { MaskedEmailNotice } from "../components/MaskedEmailNotice";
import { OtpVerificationFormContainer } from "../components/OtpVerificationFormContainer";

export const OtpVerificationPage = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email");

    if (!email) {
        return <Navigate to="/forgot-password" replace />;
    }

    return (
        <AuthLayout>
            <AuthCard>
                <AuthHeader title="Xác thực mã OTP" />
                <MaskedEmailNotice email={email} />
                <OtpVerificationFormContainer email={email} />
            </AuthCard>
        </AuthLayout>
    );
};

export default OtpVerificationPage;
