import { apiClient } from "@/lib/axios";
import type { LoginRequest, LoginResponse } from "./types";

export const loginApi = async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/v1/auth/login", data);
    return response.data;
};
