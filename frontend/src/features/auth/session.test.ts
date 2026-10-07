import axios from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** Mỗi test nạp lại module để có store và bước khôi phục phiên mới, như khi tải lại trang. */
const loadFreshModules = async () => {
    vi.resetModules();
    const { useAuthStore } = await import("./store");
    const { restoreSession } = await import("./session");
    return { useAuthStore, restoreSession };
};

describe("restoreSession", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("starts as restoring so guards wait for the answer", async () => {
        const { useAuthStore } = await loadFreshModules();

        expect(useAuthStore.getState().status).toBe("restoring");
        expect(useAuthStore.getState().accessToken).toBeNull();
    });

    it("restores the session from the refresh cookie and keeps the token in memory only", async () => {
        const post = vi
            .spyOn(axios, "post")
            .mockResolvedValue({ data: { data: { accessToken: "fresh" } } });
        const { useAuthStore, restoreSession } = await loadFreshModules();

        await restoreSession();

        expect(post).toHaveBeenCalledWith(
            expect.stringContaining("/api/auth/refresh-token"),
            null,
            {
                withCredentials: true,
            },
        );
        expect(useAuthStore.getState()).toMatchObject({
            status: "authenticated",
            isAuthenticated: true,
            accessToken: "fresh",
        });
        expect(localStorage.length).toBe(0);
        expect(sessionStorage.length).toBe(0);
    });

    it("becomes anonymous when there is no valid refresh cookie", async () => {
        vi.spyOn(axios, "post").mockRejectedValue(new Error("401"));
        const { useAuthStore, restoreSession } = await loadFreshModules();

        await restoreSession();

        expect(useAuthStore.getState()).toMatchObject({
            status: "anonymous",
            isAuthenticated: false,
        });
    });

    it("calls refresh only once even if restore is triggered twice", async () => {
        // Ví dụ trang vừa tải đã có request 401 cần refresh: hai lần refresh đồng thời sẽ xoay vòng cookie hai lần
        const post = vi
            .spyOn(axios, "post")
            .mockResolvedValue({ data: { data: { accessToken: "fresh" } } });
        const { restoreSession } = await loadFreshModules();

        await Promise.all([restoreSession(), restoreSession()]);

        expect(post).toHaveBeenCalledTimes(1);
    });

    it("removes access tokens left in web storage by the previous version", async () => {
        localStorage.setItem("auth_access_token", "old-remembered-token");
        sessionStorage.setItem("auth_access_token", "old-session-token");

        await loadFreshModules();

        expect(localStorage.getItem("auth_access_token")).toBeNull();
        expect(sessionStorage.getItem("auth_access_token")).toBeNull();
    });
});
