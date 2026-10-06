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
            <title>Xác thực mã OTP - HRM System</title>
            <AuthCard>
                <AuthHeader
                    title="Xác thực mã OTP"
                    description={
                        <>
                            Mã xác thực 6 chữ số đã được gửi tới hòm thư{" "}
                            <strong className="font-semibold text-ink">{maskEmail(email)}</strong>
                        </>
                    }
                />
                <OtpVerificationFormContainer email={email} />
            </AuthCard>
        </AuthLayout>
    );
};
