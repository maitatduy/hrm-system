import { create } from "zustand";
import type { AuthState } from "./types";

const ACCESS_TOKEN_KEY = "auth_access_token";

// "Ghi nhớ đăng nhập" lưu token vào localStorage (giữ qua lần mở trình duyệt sau),
// ngược lại dùng sessionStorage (mất khi đóng trình duyệt).
const tokenStorage = {
    read: (): string | null =>
        localStorage.getItem(ACCESS_TOKEN_KEY) ?? sessionStorage.getItem(ACCESS_TOKEN_KEY),
    write: (token: string, rememberMe: boolean) => {
        tokenStorage.clear();
        (rememberMe ? localStorage : sessionStorage).setItem(ACCESS_TOKEN_KEY, token);
    },
    /** Cập nhật token sau khi refresh, giữ nguyên nơi lưu đã chọn lúc đăng nhập. */
    replace: (token: string) => {
        const storage =
            localStorage.getItem(ACCESS_TOKEN_KEY) !== null ? localStorage : sessionStorage;
        storage.setItem(ACCESS_TOKEN_KEY, token);
    },
    clear: () => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    },
};

const initialToken = tokenStorage.read();

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: initialToken,
    isAuthenticated: initialToken !== null,
    sessionUser: null,
    setAuth: ({ accessToken, user, rememberMe }) => {
        tokenStorage.write(accessToken, rememberMe);
        set({ accessToken, isAuthenticated: true, sessionUser: user });
    },
    setAccessToken: (accessToken) => {
        tokenStorage.replace(accessToken);
        set({ accessToken, isAuthenticated: true });
    },
    setSessionUser: (user) => set({ sessionUser: user }),
    clearAuth: () => {
        tokenStorage.clear();
        set({ accessToken: null, isAuthenticated: false, sessionUser: null });
    },
}));
