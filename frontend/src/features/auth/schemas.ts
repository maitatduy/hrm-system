import { z } from "zod";
import { PASSWORD_MAX_LENGTH, PASSWORD_RULES } from "./passwordRules";

const workEmailSchema = z
    .string()
    .trim()
    .min(1, "Vui lòng nhập địa chỉ email")
    .email("Định dạng email công việc không hợp lệ (ví dụ: ten@congty.vn)");

const newPasswordSchema = z
    .string()
    .max(PASSWORD_MAX_LENGTH, `Mật khẩu không được vượt quá ${PASSWORD_MAX_LENGTH} ký tự`)
    .superRefine((password, ctx) => {
        const failedRule = PASSWORD_RULES.find((rule) => !rule.test(password));
        if (failedRule) {
            ctx.addIssue({ code: "custom", message: failedRule.message });
        }
    });

const confirmPasswordSchema = z.string().min(1, "Vui lòng xác nhận mật khẩu mới");

export const loginFormSchema = z.object({
    email: workEmailSchema,
    password: z.string().min(1, "Vui lòng nhập mật khẩu"),
    rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const forgotPasswordFormSchema = z.object({
    email: workEmailSchema,
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

export const resetPasswordSchema = z
    .object({
        newPassword: newPasswordSchema,
        confirmPassword: confirmPasswordSchema,
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Mật khẩu xác nhận không trùng khớp",
        path: ["confirmPassword"],
    });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
        newPassword: newPasswordSchema,
        confirmPassword: confirmPasswordSchema,
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Mật khẩu xác nhận không trùng khớp",
        path: ["confirmPassword"],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: "Mật khẩu mới không được trùng với mật khẩu hiện tại",
        path: ["newPassword"],
    });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
