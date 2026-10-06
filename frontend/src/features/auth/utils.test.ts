import { describe, expect, it } from "vitest";
import { getHomePathByRole, getSafeRedirectPath, maskEmail } from "./utils";

describe("getSafeRedirectPath", () => {
    it("accepts internal paths", () => {
        expect(getSafeRedirectPath("/settings?tab=security")).toBe("/settings?tab=security");
    });

    it.each([null, "", "settings", "https://evil.com", "//evil.com", "/\\evil.com"])(
        "rejects unsafe redirect %s",
        (redirect) => {
            expect(getSafeRedirectPath(redirect)).toBeNull();
        },
    );
});

describe("getHomePathByRole", () => {
    it.each([
        ["ADMIN", "/dashboard"],
        ["HR", "/dashboard"],
        ["MANAGER", "/management/dashboard"],
        ["EMPLOYEE", "/portal/dashboard"],
    ] as const)("routes %s to %s", (role, path) => {
        expect(getHomePathByRole(role)).toBe(path);
    });
});

describe("maskEmail", () => {
    it("keeps first two and last character of long names", () => {
        expect(maskEmail("nguyenvana@hrm.vn")).toBe("ng***a@hrm.vn");
    });

    it("keeps only the first character of short names", () => {
        expect(maskEmail("an@hrm.vn")).toBe("a***@hrm.vn");
    });

    it("returns input unchanged when it is not an email", () => {
        expect(maskEmail("not-an-email")).toBe("not-an-email");
    });
});
