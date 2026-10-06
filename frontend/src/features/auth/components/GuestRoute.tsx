import { Navigate, Outlet, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store";
import { getSafeRedirectPath } from "../utils";

/**
 * Các trang chỉ dành cho người chưa đăng nhập (đăng nhập, quên mật khẩu...).
 * Người đã đăng nhập được đưa về trang trong tham số ?redirect hoặc trang chủ theo vai trò.
 */
export const GuestRoute = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const [searchParams] = useSearchParams();

    if (isAuthenticated) {
        return <Navigate to={getSafeRedirectPath(searchParams.get("redirect")) ?? "/"} replace />;
    }

    return <Outlet />;
};
