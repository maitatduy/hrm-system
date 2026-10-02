import { apiClient } from "@/lib/axios";
import type { LoginRequest, LoginResponse, LogoutRequest, LogoutResponse } from "./types";

export const loginApi = async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/v1/auth/login", data);
    return response.data;
};

export const logoutApi = async (data?: LogoutRequest): Promise<LogoutResponse> => {
    const response = await apiClient.post<LogoutResponse>("/v1/auth/logout", data);
    return response.data;
};

