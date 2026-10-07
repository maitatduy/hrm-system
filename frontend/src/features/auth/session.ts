import { refreshAccessToken } from "@/lib/axios";
import { useAuthStore } from "./store";

let restorePromise: Promise<void> | null = null;

/**
 * Khôi phục phiên khi tải trang: access token không được lưu lại, nên gọi refresh bằng cookie HttpOnly để lấy token
 * mới. Có cookie hợp lệ thì phiên trở thành authenticated, ProtectedRoute tự nạp thông tin người dùng; không có thì
 * anonymous. Chỉ chạy một lần, gọi lại dùng chung kết quả; lần refresh cũng dùng chung với interceptor của axios.
 */
export const restoreSession = (): Promise<void> => {
    restorePromise ??= refreshAccessToken().then(
        () => undefined,
        () => {
            // Chỉ đánh dấu chưa đăng nhập nếu chưa có gì khác đổi trạng thái trong lúc chờ
            if (useAuthStore.getState().status === "restoring") {
                useAuthStore.getState().clearAuth();
            }
        },
    );
    return restorePromise;
};
