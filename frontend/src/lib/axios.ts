import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/features/auth/store";
import type { ApiResponse } from "./apiError";

// Path của mọi API đã bao gồm tiền tố /api, nên baseURL chỉ là origin của api-gateway
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || "";

const REFRESH_TOKEN_PATH = "/api/auth/refresh-token";

// Các endpoint này trả 401 vì sai thông tin đăng nhập, không phải vì access token hết hạn
const SKIP_REFRESH_PATHS = [
    "/api/auth/login",
    REFRESH_TOKEN_PATH,
    "/api/auth/forgot-password",
    "/api/auth/verify-otp",
    "/api/auth/reset-password",
];

export const apiClient = axios.create({
    baseURL: API_GATEWAY_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000,
    // Bắt buộc để trình duyệt lưu và gửi cookie HttpOnly refreshToken khi gọi khác origin
    withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let refreshPromise: Promise<string> | null = null;

// Gộp các request 401 đồng thời thành một lần gọi refresh duy nhất
const refreshAccessToken = (): Promise<string> => {
    refreshPromise ??= axios
        .post<ApiResponse<{ accessToken: string }>>(
            `${API_GATEWAY_URL}${REFRESH_TOKEN_PATH}`,
            null,
            { withCredentials: true },
        )
        .then((response) => {
            const accessToken = response.data.data?.accessToken;
            if (!accessToken) {
                throw new Error("Refresh response không chứa access token");
            }
            useAuthStore.getState().setAccessToken(accessToken);
            return accessToken;
        })
        .finally(() => {
            refreshPromise = null;
        });
    return refreshPromise;
};

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retried?: boolean };

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetriableRequestConfig | undefined;
        const isRefreshable =
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retried &&
            !SKIP_REFRESH_PATHS.some((path) => originalRequest.url?.startsWith(path));

        if (!isRefreshable) {
            return Promise.reject(error);
        }

        originalRequest._retried = true;
        try {
            const accessToken = await refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
        } catch {
            // Refresh thất bại: xóa phiên, ProtectedRoute sẽ tự điều hướng về trang đăng nhập
            useAuthStore.getState().clearAuth();
            return Promise.reject(error);
        }
    },
);
