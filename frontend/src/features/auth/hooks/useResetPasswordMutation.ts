import { useMutation } from "@tanstack/react-query";
import { toApiError } from "@/lib/apiError";
import { resetPasswordApi } from "../api";
import type { ResetPasswordRequest, ResetPasswordResponse } from "../types";

export const useResetPasswordMutation = () => {
    return useMutation<ResetPasswordResponse, Error, ResetPasswordRequest>({
        mutationFn: async (payload) => {
            try {
                return await resetPasswordApi(payload);
            } catch (error) {
                throw toApiError(error, "Không thể kết nối đến máy chủ xác thực. Vui lòng thử lại.");
            }
        },
    });
};
