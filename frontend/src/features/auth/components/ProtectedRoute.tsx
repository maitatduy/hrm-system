import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store";
import { useCurrentUserQuery } from "../hooks/useCurrentUserQuery";
import { getHomePathByRole } from "../roles";
import type { UserRole } from "../types";

export interface ProtectedRouteProps {
    /** Bỏ trống nghĩa là mọi người dùng đã đăng nhập đều được truy cập. */
    readonly allowedRoles?: readonly UserRole[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const location = useLocation();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const sessionUser = useAuthStore((state) => state.sessionUser);
    const setSessionUser = useAuthStore((state) => state.setSessionUser);
    const currentUserQuery = useCurrentUserQuery();

    useEffect(() => {
        if (currentUserQuery.data && !sessionUser) {
            setSessionUser(currentUserQuery.data);
        }
    }, [currentUserQuery.data, sessionUser, setSessionUser]);

    if (!isAuthenticated) {
        const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
        return <Navigate to={`/login?redirect=${redirect}`} replace />;
    }

    const user = sessionUser ?? currentUserQuery.data;

    if (!user) {
        if (currentUserQuery.isError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-canvas-soft text-[14px] text-ink-muted">
                    <p>Không thể tải thông tin phiên đăng nhập. Vui lòng thử lại.</p>
                    <button
                        type="button"
                        onClick={() => void currentUserQuery.refetch()}
                        className="px-4 py-2 rounded-md bg-primary text-white font-semibold cursor-pointer"
                    >
                        Thử lại
                    </button>
                </div>
            );
        }
        return (
            <div className="min-h-screen flex items-center justify-center bg-canvas-soft text-[14px] text-ink-muted">
                Đang tải phiên làm việc...
            </div>
        );
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={getHomePathByRole(user.role)} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
