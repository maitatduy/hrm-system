import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/lib/apiError";
import type {
    AuthUserSession,
    LoginRequest,
    LoginResponse,
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

const unwrapData = <T>(body: ApiResponse<T>): T => {
    if (body.data === undefined || body.data === null) {
        throw new Error("Phản hồi từ máy chủ không chứa dữ liệu");
    }
    return body.data;
};

export const loginApi = async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>("/api/auth/login", data);
    return unwrapData(response.data);
};

export const logoutApi = async (): Promise<LogoutResponse> => {
    const response = await apiClient.post<ApiResponse<null>>("/api/auth/logout");
    return response.data;
};

export const getCurrentUserApi = async (): Promise<AuthUserSession> => {
    const response = await apiClient.get<ApiResponse<AuthUserSession>>("/api/auth/me");
    return unwrapData(response.data);
};

export const forgotPasswordApi = async (
    data: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> => {
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

// Backend không có endpoint resend riêng: gửi lại OTP chính là gọi lại forgot-password (có cooldown 60 giây)
export const resendOtpApi = async (data: ResendOtpRequest): Promise<ResendOtpResponse> =>
    forgotPasswordApi(data);

export const resetPasswordApi = async (
    data: ResetPasswordRequest,
): Promise<ResetPasswordResponse> => {
    const response = await apiClient.post<ApiResponse<null>>("/api/auth/reset-password", data);
    return response.data;
};

export const changePasswordApi = async (
    data: ChangePasswordRequest,
): Promise<ChangePasswordResponse> => {
    const response = await apiClient.put<ApiResponse<null>>("/api/auth/change-password", data);
    return response.data;
};
