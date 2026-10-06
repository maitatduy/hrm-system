import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/Button";
import { useAuthStore } from "../store";
import { useCurrentUserQuery } from "../hooks/useCurrentUserQuery";
import { getHomePathByRole } from "../utils";
import type { UserRole } from "../types";

export interface ProtectedRouteProps {
    /** Bỏ trống nghĩa là mọi người dùng đã đăng nhập đều được truy cập. */
    readonly allowedRoles?: readonly UserRole[];
}

const FullScreenMessage = ({ children }: { readonly children: ReactNode }) => (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-canvas-soft text-[14px] text-ink-muted">
        {children}
    </div>
);

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const location = useLocation();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const sessionUser = useAuthStore((state) => state.sessionUser);
    const currentUserQuery = useCurrentUserQuery();

    if (!isAuthenticated) {
        const target = `${location.pathname}${location.search}`;
        const query = target === "/" ? "" : `?redirect=${encodeURIComponent(target)}`;
        return <Navigate to={`/login${query}`} replace />;
    }

    if (!sessionUser) {
        return currentUserQuery.isError ? (
            <FullScreenMessage>
                <p>Không thể tải thông tin phiên đăng nhập. Vui lòng thử lại.</p>
                <Button className="h-10 w-auto" onClick={() => void currentUserQuery.refetch()}>
                    Thử lại
                </Button>
            </FullScreenMessage>
        ) : (
            <FullScreenMessage>
                <p role="status">Đang tải phiên làm việc...</p>
            </FullScreenMessage>
        );
    }

    if (allowedRoles && !allowedRoles.includes(sessionUser.role)) {
        return <Navigate to={getHomePathByRole(sessionUser.role)} replace />;
    }

    return <Outlet />;
};

/** Trang gốc "/" đưa người dùng đã đăng nhập về trang chủ theo vai trò. Dùng bên trong ProtectedRoute. */
export const RoleHomeRedirect = () => {
    const sessionUser = useAuthStore((state) => state.sessionUser);
    return sessionUser ? <Navigate to={getHomePathByRole(sessionUser.role)} replace /> : null;
};
