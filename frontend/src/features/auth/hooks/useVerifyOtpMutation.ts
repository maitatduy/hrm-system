import { useMutation } from "@tanstack/react-query";
import { toApiError } from "@/lib/apiError";
import { verifyOtpApi } from "../api";
import type { VerifyOtpRequest, VerifyOtpResponse } from "../types";

export const useVerifyOtpMutation = () => {
    return useMutation<VerifyOtpResponse, Error, VerifyOtpRequest>({
        mutationFn: async (payload) => {
            try {
                return await verifyOtpApi(payload);
            } catch (error) {
                throw toApiError(error, "Không thể kết nối đến máy chủ xác thực. Vui lòng thử lại.");
            }
        },
    });
};
