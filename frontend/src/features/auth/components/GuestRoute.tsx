import { Navigate, Outlet, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store";
import { getSafeRedirectPath } from "../utils";
import { SessionRestoring } from "./SessionRestoring";

/**
 * Các trang chỉ dành cho người chưa đăng nhập (đăng nhập, quên mật khẩu...).
 * Người đã đăng nhập được đưa về trang trong tham số ?redirect hoặc trang chủ theo vai trò.
 */
export const GuestRoute = () => {
    const status = useAuthStore((state) => state.status);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const [searchParams] = useSearchParams();

    // Chờ khôi phục phiên xong: người còn cookie ghi nhớ đăng nhập mở trang đăng nhập sẽ được đưa thẳng vào trong
    if (status === "restoring") {
        return <SessionRestoring />;
    }

    if (isAuthenticated) {
        return <Navigate to={getSafeRedirectPath(searchParams.get("redirect")) ?? "/"} replace />;
    }

    return <Outlet />;
};
