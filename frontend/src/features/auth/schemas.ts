import { z } from "zod";
import { VALIDATION_MESSAGES } from "@/constants/messages";
import { isStrongPassword, PASSWORD_MAX_LENGTH } from "./passwordRules";

const emailSchema = z
    .string()
    .trim()
    .min(1, VALIDATION_MESSAGES.EMAIL_REQUIRED)
    .email(VALIDATION_MESSAGES.EMAIL_INVALID);

const newPasswordSchema = z
    .string()
    .max(PASSWORD_MAX_LENGTH, VALIDATION_MESSAGES.passwordTooLong(PASSWORD_MAX_LENGTH))
    .refine(isStrongPassword, VALIDATION_MESSAGES.PASSWORD_WEAK);

const confirmPasswordSchema = z.string().min(1, VALIDATION_MESSAGES.CONFIRM_PASSWORD_REQUIRED);

const PASSWORD_MISMATCH = {
    message: VALIDATION_MESSAGES.PASSWORD_MISMATCH,
    path: ["confirmPassword"],
};

export const loginFormSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, VALIDATION_MESSAGES.PASSWORD_REQUIRED),
    rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const forgotPasswordFormSchema = z.object({
    email: emailSchema,
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

export const resetPasswordSchema = z
    .object({
        newPassword: newPasswordSchema,
        confirmPassword: confirmPasswordSchema,
    })
    .refine((data) => data.newPassword === data.confirmPassword, PASSWORD_MISMATCH);

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, VALIDATION_MESSAGES.CURRENT_PASSWORD_REQUIRED),
        newPassword: newPasswordSchema,
        confirmPassword: confirmPasswordSchema,
    })
    .refine((data) => data.newPassword === data.confirmPassword, PASSWORD_MISMATCH)
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: VALIDATION_MESSAGES.PASSWORD_SAME_AS_CURRENT,
        path: ["newPassword"],
    });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
