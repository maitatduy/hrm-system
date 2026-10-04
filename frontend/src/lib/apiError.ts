import { isAxiosError } from "axios";

/** Envelope chung mà mọi service backend trả về. */
export interface ApiResponse<T> {
    readonly status: number;
    readonly message: string;
    readonly data?: T;
    readonly errors?: Record<string, string>;
    readonly timestamp: string;
}

export type ApiMessageResponse = Pick<ApiResponse<never>, "status" | "message">;

/**
 * Ưu tiên message do backend trả về, chỉ dùng fallback khi lỗi mạng hoặc server không trả message.
 */
export const getApiErrorMessage = (error: unknown, fallback: string): string => {
    if (isAxiosError<ApiResponse<unknown>>(error)) {
        const body = error.response?.data;
        const firstFieldError = body?.errors ? Object.values(body.errors)[0] : undefined;
        if (firstFieldError) return firstFieldError;
        if (body?.message) return body.message;
    }
    return fallback;
};

export const toApiError = (error: unknown, fallback: string): Error =>
    new Error(getApiErrorMessage(error, fallback));
