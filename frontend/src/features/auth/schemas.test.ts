import { describe, expect, it } from "vitest";
import { evaluatePasswordRequirements } from "./passwordRules";
import { changePasswordSchema, resetPasswordSchema } from "./schemas";

const STRONG_PASSWORD = "Str0ng@Pass";

describe("evaluatePasswordRequirements", () => {
    it("marks every rule as met for a strong password", () => {
        expect(evaluatePasswordRequirements(STRONG_PASSWORD).every((rule) => rule.isMet)).toBe(
            true,
        );
    });

    it("reports each missing rule for a weak password", () => {
        const unmet = evaluatePasswordRequirements("abc")
            .filter((rule) => !rule.isMet)
            .map((rule) => rule.id);
        expect(unmet).toEqual(["min-length", "has-uppercase", "has-number", "has-special"]);
    });
});

describe("resetPasswordSchema", () => {
    it("accepts matching strong passwords", () => {
        const result = resetPasswordSchema.safeParse({
            newPassword: STRONG_PASSWORD,
            confirmPassword: STRONG_PASSWORD,
        });
        expect(result.success).toBe(true);
    });

    it("reports the first unmet password rule", () => {
        const result = resetPasswordSchema.safeParse({
            newPassword: "weakpass",
            confirmPassword: "weakpass",
        });
        expect(result.error?.issues[0]?.message).toBe(
            "Mật khẩu phải chứa ít nhất 1 chữ cái in hoa",
        );
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
