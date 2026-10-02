import { useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { AuthCard } from "@/components/AuthCard";
import { AuthHeader } from "../components/AuthHeader";
import { LoginFormContainer } from "../components/LoginFormContainer";

export const LoginPage = () => {
    const [searchParams] = useSearchParams();
    const isLoggedOut = searchParams.get("reason") === "logged_out";

    return (
        <AuthLayout>
            <AuthCard>
                <AuthHeader />

                {isLoggedOut && (
                    <div className="mb-4 p-3 bg-[#1aae39]/10 border border-[#1aae39]/30 rounded-xs flex items-center gap-2.5 text-[#1aae39] text-[13px] font-medium animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Bạn đã đăng xuất khỏi phiên làm việc thành công.</span>
                    </div>
                )}

                <LoginFormContainer />
            </AuthCard>
        </AuthLayout>
    );
};

export default LoginPage;

