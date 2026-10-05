import { create } from "zustand";
import type { AuthState } from "./types";

const ACCESS_TOKEN_STORAGE_KEY = "auth_access_token";

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY),
    isAuthenticated: !!localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY),
    sessionUser: null,
    setAuth: ({ accessToken, user }) => {
        localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
        set({
            accessToken,
            isAuthenticated: true,
            sessionUser: user,
        });
    },
    setAccessToken: (accessToken) => {
        localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
        set({ accessToken, isAuthenticated: true });
    },
    setSessionUser: (user) => {
        set({ sessionUser: user });
    },
    clearAuth: () => {
        localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
        set({
            accessToken: null,
            isAuthenticated: false,
            sessionUser: null,
        });
    },
}));
