import { describe, expect, it } from "vitest";
import { VALIDATION_MESSAGES } from "@/constants/messages";
import { isStrongPassword } from "./passwordRules";
import { changePasswordSchema, resetPasswordSchema } from "./schemas";

const STRONG_PASSWORD = "Str0ng@Pass";

describe("isStrongPassword", () => {
    it("accepts a password meeting every rule", () => {
        expect(isStrongPassword(STRONG_PASSWORD)).toBe(true);
    });

    it.each(["Sh0rt@", "str0ng@pass", "STR0NG@PASS", "Strong@Pass", "Str0ngPass"])(
        "rejects %s because one rule is missing",
        (password) => {
            expect(isStrongPassword(password)).toBe(false);
        },
    );
});

describe("resetPasswordSchema", () => {
    it("accepts matching strong passwords", () => {
        const result = resetPasswordSchema.safeParse({
            newPassword: STRONG_PASSWORD,
            confirmPassword: STRONG_PASSWORD,
        });
        expect(result.success).toBe(true);
    });

    it("explains the password rules when the password is weak", () => {
        const result = resetPasswordSchema.safeParse({
            newPassword: "weakpass",
            confirmPassword: "weakpass",
        });
        expect(result.error?.issues[0]?.message).toBe(VALIDATION_MESSAGES.PASSWORD_WEAK);
    });

    it("rejects mismatched confirmation", () => {
        const result = resetPasswordSchema.safeParse({
            newPassword: STRONG_PASSWORD,
            confirmPassword: `${STRONG_PASSWORD}x`,
        });
        expect(result.error?.issues[0]?.path).toEqual(["confirmPassword"]);
    });
});

describe("changePasswordSchema", () => {
    it("rejects a new password equal to the current one", () => {
        const result = changePasswordSchema.safeParse({
            currentPassword: STRONG_PASSWORD,
            newPassword: STRONG_PASSWORD,
            confirmPassword: STRONG_PASSWORD,
        });
        expect(result.error?.issues[0]?.path).toEqual(["newPassword"]);
    });
});
