import { useMutation } from "@tanstack/react-query";
import { ERROR_MESSAGES } from "@/constants/messages";
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

const forgotPassword = withApiError(forgotPasswordApi, ERROR_MESSAGES.SERVER_UNREACHABLE);
const verifyOtp = withApiError(verifyOtpApi, ERROR_MESSAGES.SERVER_UNREACHABLE);
const resetPassword = withApiError(resetPasswordApi, ERROR_MESSAGES.SERVER_UNREACHABLE);
const changePassword = withApiError(changePasswordApi, ERROR_MESSAGES.SERVER_UNREACHABLE);

/** Dùng cho cả gửi OTP lần đầu và gửi lại OTP. */
export const useForgotPasswordMutation = () =>
    useMutation<MessageResponse, Error, ForgotPasswordRequest>({ mutationFn: forgotPassword });

export const useVerifyOtpMutation = () =>
    useMutation<VerifyOtpResponse, Error, VerifyOtpRequest>({ mutationFn: verifyOtp });

export const useResetPasswordMutation = () =>
    useMutation<MessageResponse, Error, ResetPasswordRequest>({ mutationFn: resetPassword });

export const useChangePasswordMutation = () =>
    useMutation<MessageResponse, Error, ChangePasswordRequest>({ mutationFn: changePassword });
