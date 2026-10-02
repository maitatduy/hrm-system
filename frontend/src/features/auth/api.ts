import { apiClient } from "@/lib/axios";
import type {
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    LogoutResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
    ResendOtpRequest,
    ResendOtpResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    ChangePasswordRequest,
    ChangePasswordResponse,
} from "./types";

export const loginApi = async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/v1/auth/login", data);
    return response.data;
};

export const logoutApi = async (data?: LogoutRequest): Promise<LogoutResponse> => {
    const response = await apiClient.post<LogoutResponse>("/v1/auth/logout", data);
    return response.data;
};

export const forgotPasswordApi = async (
    data: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> => {
    const response = await apiClient.post<ForgotPasswordResponse>("/v1/auth/forgot-password", data);
    return response.data;
};

export const verifyOtpApi = async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    const response = await apiClient.post<VerifyOtpResponse>("/v1/auth/verify-otp", data);
    return response.data;
};

export const resendOtpApi = async (data: ResendOtpRequest): Promise<ResendOtpResponse> => {
    const response = await apiClient.post<ResendOtpResponse>("/v1/auth/resend-otp", data);
    return response.data;
};

export const resetPasswordApi = async (
    data: ResetPasswordRequest,
): Promise<ResetPasswordResponse> => {
    const response = await apiClient.post<ResetPasswordResponse>("/v1/auth/reset-password", data);
    return response.data;
};

export const changePasswordApi = async (
    data: ChangePasswordRequest,
): Promise<ChangePasswordResponse> => {
    const response = await apiClient.post<ChangePasswordResponse>("/v1/auth/change-password", data);
    return response.data;
};

