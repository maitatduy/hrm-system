import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";
import { getApiErrorMessage, withApiError } from "./apiError";

const axiosErrorWithBody = (data: unknown) =>
    new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, {
        data,
        status: 400,
        statusText: "Bad Request",
        headers: {},
        config: { headers: new AxiosHeaders() },
    });

describe("getApiErrorMessage", () => {
    it("prefers the first field validation error", () => {
        const error = axiosErrorWithBody({
            message: "Dữ liệu đầu vào không hợp lệ",
            errors: { email: "Email không đúng định dạng" },
        });
        expect(getApiErrorMessage(error, "fallback")).toBe("Email không đúng định dạng");
    });

    it("uses the backend message when there are no field errors", () => {
        const error = axiosErrorWithBody({ message: "Mật khẩu hiện tại không chính xác" });
        expect(getApiErrorMessage(error, "fallback")).toBe("Mật khẩu hiện tại không chính xác");
    });

    it("falls back for network errors and unknown values", () => {
        expect(getApiErrorMessage(new AxiosError("Network Error"), "fallback")).toBe("fallback");
        expect(getApiErrorMessage("boom", "fallback")).toBe("fallback");
    });
});

describe("withApiError", () => {
    it("rethrows failures as user-facing errors", async () => {
        const request = withApiError(async () => {
            throw axiosErrorWithBody({ message: "Mã OTP không chính xác" });
        }, "fallback");
        await expect(request()).rejects.toThrow("Mã OTP không chính xác");
    });

    it("passes through successful results", async () => {
        const request = withApiError(async (value: number) => value * 2, "fallback");
        await expect(request(21)).resolves.toBe(42);
    });
});
