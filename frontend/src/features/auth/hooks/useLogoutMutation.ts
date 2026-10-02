import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { logoutApi } from "../api";
import { useAuthStore } from "../store";

export const useLogoutMutation = (onSuccessCallback?: () => void) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const clearAuth = useAuthStore((state) => state.clearAuth);

    return useMutation({
        mutationFn: () => logoutApi(),
        onSettled: () => {
            clearAuth();

            queryClient.clear();

            onSuccessCallback?.();

            navigate("/login?reason=logged_out", { replace: true });
        },
    });
};
