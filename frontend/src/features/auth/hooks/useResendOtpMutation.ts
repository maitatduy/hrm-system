import { useMutation } from "@tanstack/react-query";
import { toApiError } from "@/lib/apiError";
import { resendOtpApi } from "../api";
import type { ResendOtpRequest, ResendOtpResponse } from "../types";

export const useResendOtpMutation = () => {
    return useMutation<ResendOtpResponse, Error, ResendOtpRequest>({
        mutationFn: async (payload) => {
            try {
                return await resendOtpApi(payload);
            } catch (error) {
                throw toApiError(error, "Không thể gửi lại mã xác thực. Vui lòng thử lại sau.");
            }
        },
    });
};
