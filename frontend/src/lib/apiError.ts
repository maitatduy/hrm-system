import { isAxiosError } from "axios";
import { ERROR_MESSAGES } from "@/constants/messages";

/** Envelope chung mà mọi service backend trả về. */
export interface ApiResponse<T> {
    readonly status: number;
    readonly message: string;
    readonly data?: T;
    readonly errors?: Record<string, string>;
    readonly timestamp: string;
}

/** Lấy phần data của envelope, báo lỗi khi backend trả về rỗng. */
export const unwrapData = <T>(body: ApiResponse<T>): T => {
    if (body.data === undefined || body.data === null) {
        throw new Error(ERROR_MESSAGES.EMPTY_RESPONSE);
    }
    return body.data;
};

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

/** Bọc hàm gọi API để mọi lỗi được chuyển thành Error mang message sẵn sàng hiển thị cho người dùng. */
export const withApiError =
    <TArgs extends unknown[], TResult>(
        request: (...args: TArgs) => Promise<TResult>,
        fallback: string,
    ) =>
    async (...args: TArgs): Promise<TResult> => {
        try {
            return await request(...args);
        } catch (error) {
            throw toApiError(error, fallback);
        }
    };
