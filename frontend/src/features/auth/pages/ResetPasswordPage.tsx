import { Navigate, useLocation } from "react-router-dom";
import { AuthCard } from "@/components/AuthCard";
import { AuthLayout } from "@/components/AuthLayout";
import { AuthHeader } from "../components/AuthHeader";
import { BackToLoginLink } from "../components/AuthLink";
import { ResetPasswordContainer } from "../components/ResetPasswordContainer";
import type { ResetPasswordLocationState } from "../types";

const isResetPasswordState = (state: unknown): state is ResetPasswordLocationState =>
    typeof state === "object" &&
    state !== null &&
    typeof (state as ResetPasswordLocationState).email === "string" &&
    typeof (state as ResetPasswordLocationState).resetToken === "string";

/** Chỉ vào được từ bước xác thực OTP, reset token nằm trong history state chứ không trên URL. */
export const ResetPasswordPage = () => {
    const { state } = useLocation();

    if (!isResetPasswordState(state)) {
        return <Navigate to="/forgot-password" replace />;
    }

    return (
        <AuthLayout>
            <title>Đặt lại mật khẩu - HRM System</title>
            <AuthCard>
                <AuthHeader
                    title="Đặt lại mật khẩu"
                    description={
                        <>
                            Tạo mật khẩu mới cho tài khoản{" "}
                            <strong className="font-semibold text-ink">{state.email}</strong>
                        </>
                    }
                />
                <ResetPasswordContainer resetToken={state.resetToken} />
                <BackToLoginLink />
            </AuthCard>
        </AuthLayout>
    );
};
