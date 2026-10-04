import { useMutation } from "@tanstack/react-query";
import { toApiError } from "@/lib/apiError";
import { changePasswordApi } from "../api";
import type { ChangePasswordRequest, ChangePasswordResponse } from "../types";

export const useChangePasswordMutation = () => {
    return useMutation<ChangePasswordResponse, Error, ChangePasswordRequest>({
        mutationFn: async (payload) => {
            try {
                return await changePasswordApi(payload);
            } catch (error) {
                throw toApiError(error, "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
            }
        },
    });
};
