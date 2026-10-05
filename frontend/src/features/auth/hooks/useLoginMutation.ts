import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toApiError } from "@/lib/apiError";
import { loginApi } from "../api";
import { useAuthStore } from "../store";
import type { LoginRequest, LoginResponse } from "../types";

export const useLoginMutation = () => {
    const queryClient = useQueryClient();
    const setAuth = useAuthStore((state) => state.setAuth);

    return useMutation<LoginResponse, Error, LoginRequest>({
        mutationFn: async (credentials) => {
            try {
                return await loginApi(credentials);
            } catch (error) {
                throw toApiError(error, "Không thể kết nối đến máy chủ xác thực. Vui lòng thử lại.");
            }
        },
        onSuccess: (data) => {
            setAuth({
                accessToken: data.accessToken,
                user: data.user,
            });
            queryClient.setQueryData(["auth", "me"], data.user);
        },
    });
};
