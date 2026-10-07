import { create } from "zustand";
import type { AuthState } from "./types";

/**
 * Access token chỉ giữ trong bộ nhớ của tab, không ghi vào Web Storage: script lạ chạy được trên trang (XSS) không
 * đọc được token cũ còn lưu trên máy, và token mất ngay khi đóng tab. Tải lại trang thì phiên được khôi phục bằng
 * cookie HttpOnly chứa refresh token (xem restoreSession). Lựa chọn "ghi nhớ đăng nhập" nằm ở thời hạn của cookie
 * đó do backend đặt, frontend không cần lưu gì.
 */
const LEGACY_ACCESS_TOKEN_KEY = "auth_access_token";

/** Phiên bản trước lưu access token trong Web Storage; xóa để token cũ không còn nằm lại trên máy người dùng. */
const removeLegacyStoredToken = () => {
    try {
        localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
        sessionStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
    } catch {
        // Trình duyệt chặn Web Storage thì cũng không có token cũ để xóa
    }
};

removeLegacyStoredToken();

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    status: "restoring",
    isAuthenticated: false,
    sessionUser: null,
    setAuth: ({ accessToken, user }) =>
        set({ accessToken, status: "authenticated", isAuthenticated: true, sessionUser: user }),
    setAccessToken: (accessToken) =>
        set({ accessToken, status: "authenticated", isAuthenticated: true }),
    setSessionUser: (user) => set({ sessionUser: user }),
    clearAuth: () =>
        set({ accessToken: null, status: "anonymous", isAuthenticated: false, sessionUser: null }),
}));
