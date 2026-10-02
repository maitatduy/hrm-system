import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { changePasswordApi } from "../api";
import type { ChangePasswordRequest, ChangePasswordResponse } from "../types";

export const useChangePasswordMutation = () => {
    return useMutation<ChangePasswordResponse, Error, ChangePasswordRequest>({
        mutationFn: async (payload) => {
            try {
                return await changePasswordApi(payload);
            } catch (error) {
                if (isAxiosError(error)) {
                    if (error.response?.status === 400) {
                        throw new Error("Mật khẩu hiện tại không chính xác. Vui lòng kiểm tra lại.");
                    }
                    if (error.response?.status === 422) {
                        throw new Error(
                            "Mật khẩu mới không được trùng với mật khẩu gần nhất của bạn.",
                        );
                    }
                    const serverMsg = error.response?.data?.message;
                    if (serverMsg) {
                        throw new Error(serverMsg);
                    }
                }
                throw new Error("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
            }
        },
    });
};
