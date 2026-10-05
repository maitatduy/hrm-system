import { useMutation } from "@tanstack/react-query";
import { toApiError } from "@/lib/apiError";
import { forgotPasswordApi } from "../api";
import type { ForgotPasswordRequest, ForgotPasswordResponse } from "../types";

export const useForgotPasswordMutation = () => {
    return useMutation<ForgotPasswordResponse, Error, ForgotPasswordRequest>({
        mutationFn: async (payload) => {
            try {
                return await forgotPasswordApi(payload);
            } catch (error) {
                throw toApiError(error, "Không thể kết nối đến máy chủ xác thực. Vui lòng thử lại.");
            }
        },
    });
};
