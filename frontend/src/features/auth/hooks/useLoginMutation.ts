import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
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
                if (isAxiosError(error)) {
                    if (error.response?.status === 401 || error.response?.status === 400) {
                        throw new Error(
                            "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.",
                        );
                    }
                    const serverMsg = error.response?.data?.message;
                    if (serverMsg) {
                        throw new Error(serverMsg);
                    }
                }
                throw new Error("Không thể kết nối đến máy chủ xác thực. Vui lòng thử lại.");
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
