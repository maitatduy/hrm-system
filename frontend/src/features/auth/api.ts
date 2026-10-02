import { apiClient } from "@/lib/axios";
import type {
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    LogoutResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
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

