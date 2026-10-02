import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { resetPasswordApi } from "../api";
import type { ResetPasswordRequest, ResetPasswordResponse } from "../types";

export const useResetPasswordMutation = () => {
    return useMutation<ResetPasswordResponse, Error, ResetPasswordRequest>({
        mutationFn: async (payload) => {
            try {
                return await resetPasswordApi(payload);
            } catch (error) {
                if (isAxiosError(error)) {
                    if (error.response?.status === 400 || error.response?.status === 401) {
                        throw new Error(
                            "Phiên đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. Vui lòng gửi lại yêu cầu OTP.",
                        );
                    }
                    if (error.response?.status === 429) {
                        throw new Error(
                            "Bạn đã gửi yêu cầu quá nhiều lần. Vui lòng chờ 5 phút trước khi thử lại.",
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
