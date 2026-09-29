import { create } from "zustand";
import type { AuthState } from "./types";

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: localStorage.getItem("auth_access_token"),
    isAuthenticated: !!localStorage.getItem("auth_access_token"),
    sessionUser: null,
    setAuth: ({ accessToken, user }) => {
        localStorage.setItem("auth_access_token", accessToken);
        set({
            accessToken,
            isAuthenticated: true,
            sessionUser: user,
        });
    },
    clearAuth: () => {
        localStorage.removeItem("auth_access_token");
        set({
            accessToken: null,
            isAuthenticated: false,
            sessionUser: null,
        });
    },
}));
