import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { resendOtpApi } from "../api";
import type { ResendOtpRequest, ResendOtpResponse } from "../types";

export const useResendOtpMutation = () => {
    return useMutation<ResendOtpResponse, Error, ResendOtpRequest>({
        mutationFn: async (payload) => {
            try {
                return await resendOtpApi(payload);
            } catch (error) {
                if (isAxiosError(error)) {
                    if (error.response?.status === 429) {
                        throw new Error(
                            "Bạn đã gửi yêu cầu quá nhiều lần. Vui lòng chờ 5 phút trước khi thử lại để đảm bảo an toàn.",
                        );
                    }
                    const serverMsg = error.response?.data?.message;
                    if (serverMsg) {
                        throw new Error(serverMsg);
                    }
                }
                throw new Error("Không thể gửi lại mã xác thực. Vui lòng thử lại sau.");
            }
        },
    });
};
