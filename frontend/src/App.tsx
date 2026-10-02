import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { ForgotPasswordPage } from "./features/auth/pages/ForgotPasswordPage";
import { OtpVerificationPage } from "./features/auth/pages/OtpVerificationPage";
import { UserProfileContainer } from "./features/auth/components/UserProfileContainer";

const DashboardShell = ({ title }: { readonly title: string }) => {
    return (
        <div className="min-h-screen bg-[#f6f5f4] flex flex-col font-sans">
            <header className="fixed top-0 left-0 w-full z-40 flex items-center justify-between px-6 h-16 bg-white border-b border-[#e6e6e6] shadow-xs">
                <div className="flex items-center gap-4">
                    <div className="flex items-center cursor-pointer select-none">
                        <span className="font-bold text-[18px] tracking-tight text-[#000000]">
                            HRM System
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <UserProfileContainer />
                </div>
            </header>

            <div className="pt-16 flex flex-1">
                <aside className="w-64 bg-white border-r border-[#e6e6e6] p-4 hidden md:block">
                    <nav className="flex flex-col gap-1">
                        <div className="px-3 py-2 rounded-md bg-[#0075de]/10 text-[#0075de] font-semibold text-[14px]">
                            Tổng quan
                        </div>
                        <div className="px-3 py-2 rounded-md text-[#31302e] hover:bg-[#f6f5f4] text-[14px] cursor-pointer">
                            Hồ sơ nhân viên
                        </div>
                        <div className="px-3 py-2 rounded-md text-[#31302e] hover:bg-[#f6f5f4] text-[14px] cursor-pointer">
                            Chấm công
                        </div>
                        <div className="px-3 py-2 rounded-md text-[#31302e] hover:bg-[#f6f5f4] text-[14px] cursor-pointer">
                            Nghỉ phép
                        </div>
                        <div className="px-3 py-2 rounded-md text-[#31302e] hover:bg-[#f6f5f4] text-[14px] cursor-pointer">
                            Bảng lương
                        </div>
                        <div className="px-3 py-2 rounded-md text-[#31302e] hover:bg-[#f6f5f4] text-[14px] cursor-pointer">
                            Cài đặt
                        </div>
                    </nav>
                </aside>

                <main className="flex-1 p-6">
                    <div className="bg-white rounded-lg border border-[#e6e6e6] p-6 shadow-xs max-w-4xl">
                        <h1 className="text-xl font-bold text-[#000000]">{title}</h1>
                        <p className="text-[14px] text-[#615d59] mt-2">
                            Chào mừng bạn trở lại không gian làm việc HRM System. Bạn có thể nhấn vào menu người dùng ở góc trên bên phải để kích hoạt chức năng đăng xuất an toàn.
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
};

export const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/verify-otp" element={<OtpVerificationPage />} />
                    <Route
                        path="/dashboard"
                        element={<DashboardShell title="Admin/HR Dashboard" />}
                    />
                    <Route
                        path="/management/dashboard"
                        element={<DashboardShell title="Manager Dashboard" />}
                    />
                    <Route
                        path="/portal/dashboard"
                        element={<DashboardShell title="Employee Portal" />}
                    />
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
};

export default App;
