import { useMutation, useQueryClient } from "@tanstack/react-query";
import { withApiError } from "@/lib/apiError";
import { loginApi } from "../api";
import { useAuthStore } from "../store";
import type { LoginResponse } from "../types";
import type { LoginFormValues } from "../schemas";
import { CURRENT_USER_QUERY_KEY } from "./useCurrentUserQuery";

const login = withApiError(
    ({ email, password }: LoginFormValues) => loginApi({ email, password }),
    "Không thể kết nối đến máy chủ xác thực. Vui lòng thử lại.",
);

export const useLoginMutation = () => {
    const queryClient = useQueryClient();
    const setAuth = useAuthStore((state) => state.setAuth);

    return useMutation<LoginResponse, Error, LoginFormValues>({
        mutationFn: login,
        onSuccess: (data, { rememberMe }) => {
            setAuth({ accessToken: data.accessToken, user: data.user, rememberMe });
            queryClient.setQueryData(CURRENT_USER_QUERY_KEY, data.user);
        },
    });
};
