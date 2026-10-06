import { Navigate, Route, Routes } from "react-router-dom";
import { GuestRoute } from "@/features/auth/components/GuestRoute";
import { ProtectedRoute, RoleHomeRedirect } from "@/features/auth/components/ProtectedRoute";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { OtpVerificationPage } from "@/features/auth/pages/OtpVerificationPage";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";
import { DashboardPage as AdminDashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { DashboardLayout } from "./DashboardLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { SettingsPage } from "./pages/SettingsPage";

export const AppRoutes = () => (
    <Routes>
        <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-otp" element={<OtpVerificationPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
            <Route index element={<RoleHomeRedirect />} />
            <Route element={<DashboardLayout />}>
                <Route
                    path="/portal/dashboard"
                    element={<DashboardPage title="Cổng nhân viên" />}
                />
                <Route path="/settings" element={<SettingsPage />} />
            </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["ADMIN", "HR"]} />}>
            <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<AdminDashboardPage />} />
            </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["MANAGER"]} />}>
            <Route element={<DashboardLayout />}>
                <Route
                    path="/management/dashboard"
                    element={<DashboardPage title="Tổng quan quản lý" />}
                />
            </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
);
