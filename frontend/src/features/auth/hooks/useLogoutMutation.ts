import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { logoutApi } from "../api";
import { useAuthStore } from "../store";
import type { LoginRedirectReason } from "../types";

/**
 * Luôn xóa phiên ở frontend dù API logout lỗi (ví dụ token đã hết hạn),
 * sau đó đưa người dùng về trang đăng nhập kèm lý do để hiển thị thông báo.
 */
export const useLogoutMutation = (reason: LoginRedirectReason = "logged_out") => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const clearAuth = useAuthStore((state) => state.clearAuth);

    return useMutation({
        mutationFn: logoutApi,
        onSettled: () => {
            clearAuth();
            queryClient.clear();
            navigate(`/login?reason=${reason}`, { replace: true });
        },
    });
};
