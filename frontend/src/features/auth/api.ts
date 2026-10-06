import { apiClient } from "@/lib/axios";
import { unwrapData, type ApiResponse } from "@/lib/apiError";
import type {
    AuthUserSession,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    LoginResponse,
    MessageResponse,
    ResetPasswordRequest,
    VerifyOtpRequest,
    VerifyOtpResponse,
} from "./types";

export const loginApi = async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>("/api/auth/login", data);
    return unwrapData(response.data);
};

export const logoutApi = async (): Promise<MessageResponse> => {
    const response = await apiClient.post<ApiResponse<null>>("/api/auth/logout");
    return response.data;
};

export const getCurrentUserApi = async (): Promise<AuthUserSession> => {
    const response = await apiClient.get<ApiResponse<AuthUserSession>>("/api/auth/me");
    return unwrapData(response.data);
};

/** Gửi OTP lần đầu và cả khi gửi lại, backend giới hạn 60 giây giữa hai lần gửi. */
export const forgotPasswordApi = async (data: ForgotPasswordRequest): Promise<MessageResponse> => {
    const response = await apiClient.post<ApiResponse<null>>("/api/auth/forgot-password", data);
    return response.data;
};

export const verifyOtpApi = async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    const response = await apiClient.post<ApiResponse<VerifyOtpResponse>>(
        "/api/auth/verify-otp",
        data,
    );
    return unwrapData(response.data);
};

export const resetPasswordApi = async (data: ResetPasswordRequest): Promise<MessageResponse> => {
    const response = await apiClient.post<ApiResponse<null>>("/api/auth/reset-password", data);
    return response.data;
};

export const changePasswordApi = async (data: ChangePasswordRequest): Promise<MessageResponse> => {
    const response = await apiClient.put<ApiResponse<null>>("/api/auth/change-password", data);
    return response.data;
};
