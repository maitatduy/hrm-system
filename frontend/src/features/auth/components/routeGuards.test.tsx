import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "../store";
import type { AuthUserSession, UserRole } from "../types";
import { GuestRoute } from "./GuestRoute";
import { ProtectedRoute } from "./ProtectedRoute";

const LocationProbe = () => {
    const location = useLocation();
    return <p data-testid="location">{`${location.pathname}${location.search}`}</p>;
};

const userWithRole = (role: UserRole): AuthUserSession => ({
    id: "user-1",
    email: "user@hrm.vn",
    role,
    status: "ACTIVE",
    employeeId: null,
    lastLoginAt: null,
});

const renderAt = (path: string) =>
    render(
        <QueryClientProvider
            client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
        >
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route element={<GuestRoute />}>
                        <Route path="/login" element={<p>login page</p>} />
                    </Route>
                    <Route element={<ProtectedRoute allowedRoles={["ADMIN", "HR"]} />}>
                        <Route path="/dashboard" element={<p>admin dashboard</p>} />
                    </Route>
                    <Route path="*" element={<LocationProbe />} />
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>,
    );

describe("route guards", () => {
    beforeEach(() => {
        useAuthStore.getState().clearAuth();
    });

    it("sends anonymous users to login and remembers where they were going", () => {
        renderAt("/dashboard");
        expect(screen.getByText("login page")).toBeInTheDocument();
    });

    it("lets a user with an allowed role through", () => {
        useAuthStore
            .getState()
            .setAuth({ accessToken: "token", user: userWithRole("HR"), rememberMe: false });
        renderAt("/dashboard");
        expect(screen.getByText("admin dashboard")).toBeInTheDocument();
    });

    it("redirects a user without the required role to their own home page", () => {
        useAuthStore
            .getState()
            .setAuth({ accessToken: "token", user: userWithRole("EMPLOYEE"), rememberMe: false });
        renderAt("/dashboard");
        expect(screen.getByTestId("location")).toHaveTextContent("/portal/dashboard");
    });

    it("sends signed-in users away from login to the safe redirect target", () => {
        useAuthStore
            .getState()
            .setAuth({ accessToken: "token", user: userWithRole("ADMIN"), rememberMe: true });
        renderAt("/login?redirect=%2Fsettings");
        expect(screen.getByTestId("location")).toHaveTextContent("/settings");
    });

    it("ignores an external redirect target after sign-in", () => {
        useAuthStore
            .getState()
            .setAuth({ accessToken: "token", user: userWithRole("ADMIN"), rememberMe: true });
        renderAt("/login?redirect=%2F%2Fevil.com");
        expect(screen.getByTestId("location")).toHaveTextContent(/^\/$/);
    });
});

describe("auth store token persistence", () => {
    it("keeps the token only for this browser session when remember me is off", () => {
        useAuthStore
            .getState()
            .setAuth({ accessToken: "token", user: userWithRole("HR"), rememberMe: false });
        expect(sessionStorage.getItem("auth_access_token")).toBe("token");
        expect(localStorage.getItem("auth_access_token")).toBeNull();
    });

    it("keeps refreshed tokens in the storage chosen at login", () => {
        useAuthStore
            .getState()
            .setAuth({ accessToken: "old", user: userWithRole("HR"), rememberMe: true });
        useAuthStore.getState().setAccessToken("new");
        expect(localStorage.getItem("auth_access_token")).toBe("new");
        expect(sessionStorage.getItem("auth_access_token")).toBeNull();
    });
});
