import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { forgotPasswordApi } from "../api";
import type { ForgotPasswordRequest, ForgotPasswordResponse } from "../types";

export const useForgotPasswordMutation = () => {
    return useMutation<ForgotPasswordResponse, Error, ForgotPasswordRequest>({
        mutationFn: async (payload) => {
            try {
                return await forgotPasswordApi(payload);
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
                throw new Error("Không thể kết nối đến máy chủ xác thực. Vui lòng thử lại.");
            }
        },
    });
};
