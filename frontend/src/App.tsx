import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { LoginPage } from "./features/auth/pages/LoginPage";

export const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route
                        path="/forgot-password"
                        element={
                            <div className="min-h-screen flex items-center justify-center bg-[#f6f5f4] p-4">
                                <div className="bg-white p-6 rounded-lg border border-[#e6e6e6] max-w-md w-full text-center">
                                    <h2 className="text-[20px] font-bold text-[#000000] mb-2">
                                        Quên mật khẩu
                                    </h2>
                                    <p className="text-[14px] text-[#615d59] mb-4">
                                        Vui lòng liên hệ quản trị viên hệ thống để được cấp lại mật
                                        khẩu.
                                    </p>
                                    <a
                                        href="/login"
                                        className="inline-block px-4 py-2 bg-[#0075de] text-white rounded-full text-[14px] font-medium"
                                    >
                                        Quay lại đăng nhập
                                    </a>
                                </div>
                            </div>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <div className="p-8">
                                <h1 className="text-2xl font-bold">Admin/HR Dashboard</h1>
                            </div>
                        }
                    />
                    <Route
                        path="/management/dashboard"
                        element={
                            <div className="p-8">
                                <h1 className="text-2xl font-bold">Manager Dashboard</h1>
                            </div>
                        }
                    />
                    <Route
                        path="/portal/dashboard"
                        element={
                            <div className="p-8">
                                <h1 className="text-2xl font-bold">Employee Portal</h1>
                            </div>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
};

export default App;
