import { describe, expect, it } from "vitest";
import { getInitialsFromEmail, getInitialsFromName } from "./initials";

describe("getInitialsFromName", () => {
    it("uses the first letters of the first and last words", () => {
        expect(getInitialsFromName("Nguyễn Văn An")).toBe("NA");
    });

    it("uses the first two letters of a single word", () => {
        expect(getInitialsFromName("an")).toBe("AN");
    });

    it("falls back when name is blank", () => {
        expect(getInitialsFromName("   ")).toBe("NA");
    });
});

describe("getInitialsFromEmail", () => {
    it("uses the first two letters of the local part", () => {
        expect(getInitialsFromEmail("admin@hrm.local")).toBe("AD");
    });

    it("falls back when email is missing", () => {
        expect(getInitialsFromEmail(undefined)).toBe("NA");
    });
});
