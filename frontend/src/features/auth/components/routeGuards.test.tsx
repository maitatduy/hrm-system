import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
        useAuthStore.getState().setAuth({ accessToken: "token", user: userWithRole("HR") });
        renderAt("/dashboard");
        expect(screen.getByText("admin dashboard")).toBeInTheDocument();
    });

    it("redirects a user without the required role to their own home page", () => {
        useAuthStore.getState().setAuth({ accessToken: "token", user: userWithRole("EMPLOYEE") });
        renderAt("/dashboard");
        expect(screen.getByTestId("location")).toHaveTextContent("/portal/dashboard");
    });

    it("sends signed-in users away from login to the safe redirect target", () => {
        useAuthStore.getState().setAuth({ accessToken: "token", user: userWithRole("ADMIN") });
        renderAt("/login?redirect=%2Fsettings");
        expect(screen.getByTestId("location")).toHaveTextContent("/settings");
    });

    it("ignores an external redirect target after sign-in", () => {
        useAuthStore.getState().setAuth({ accessToken: "token", user: userWithRole("ADMIN") });
        renderAt("/login?redirect=%2F%2Fevil.com");
        expect(screen.getByTestId("location")).toHaveTextContent(/^\/$/);
    });
});

describe("while the session is being restored on page load", () => {
    beforeEach(() => {
        useAuthStore.setState({ status: "restoring", isAuthenticated: false, accessToken: null });
    });

    it("waits instead of sending a signed-in user to the login page", () => {
        renderAt("/dashboard");
        expect(screen.getByRole("status")).toHaveTextContent("Đang tải...");
        expect(screen.queryByText("login page")).not.toBeInTheDocument();
    });

    it("waits on guest pages so a remembered user is not shown the login form", () => {
        renderAt("/login");
        expect(screen.getByRole("status")).toBeInTheDocument();
        expect(screen.queryByText("login page")).not.toBeInTheDocument();
    });
});

describe("auth store", () => {
    it("never writes the access token to web storage", () => {
        const setItem = vi.spyOn(Storage.prototype, "setItem");

        useAuthStore.getState().setAuth({ accessToken: "token", user: userWithRole("HR") });
        useAuthStore.getState().setAccessToken("refreshed");

        expect(setItem).not.toHaveBeenCalled();
        expect(localStorage.length).toBe(0);
        expect(sessionStorage.length).toBe(0);
        setItem.mockRestore();
    });
});
