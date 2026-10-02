import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { verifyOtpApi } from "../api";
import type { VerifyOtpRequest, VerifyOtpResponse } from "../types";

export const useVerifyOtpMutation = () => {
    return useMutation<VerifyOtpResponse, Error, VerifyOtpRequest>({
        mutationFn: async (payload) => {
            try {
                return await verifyOtpApi(payload);
            } catch (error) {
                if (isAxiosError(error)) {
                    if (error.response?.status === 400 || error.response?.status === 401) {
                        throw new Error(
                            "Mã xác thực không chính xác hoặc đã hết hiệu lực. Vui lòng kiểm tra lại.",
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
    });
};
