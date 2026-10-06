import { useMutation } from "@tanstack/react-query";
import { withApiError } from "@/lib/apiError";
import { changePasswordApi, forgotPasswordApi, resetPasswordApi, verifyOtpApi } from "../api";
import type {
    ChangePasswordRequest,
    ForgotPasswordRequest,
    MessageResponse,
    ResetPasswordRequest,
    VerifyOtpRequest,
    VerifyOtpResponse,
} from "../types";

const CONNECTION_ERROR = "Không thể kết nối đến máy chủ xác thực. Vui lòng thử lại.";

const forgotPassword = withApiError(forgotPasswordApi, CONNECTION_ERROR);
const verifyOtp = withApiError(verifyOtpApi, CONNECTION_ERROR);
const resetPassword = withApiError(resetPasswordApi, CONNECTION_ERROR);
const changePassword = withApiError(changePasswordApi, CONNECTION_ERROR);

/** Dùng cho cả gửi OTP lần đầu và gửi lại OTP. */
export const useForgotPasswordMutation = () =>
    useMutation<MessageResponse, Error, ForgotPasswordRequest>({ mutationFn: forgotPassword });

export const useVerifyOtpMutation = () =>
    useMutation<VerifyOtpResponse, Error, VerifyOtpRequest>({ mutationFn: verifyOtp });

export const useResetPasswordMutation = () =>
    useMutation<MessageResponse, Error, ResetPasswordRequest>({ mutationFn: resetPassword });

export const useChangePasswordMutation = () =>
    useMutation<MessageResponse, Error, ChangePasswordRequest>({ mutationFn: changePassword });
