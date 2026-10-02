import { z } from "zod";
import type { PasswordRequirement } from "./types";

export const loginFormSchema = z.object({
    email: z
        .string()
        .min(1, "Vui lòng nhập địa chỉ email")
        .email("Định dạng email công việc không hợp lệ (ví dụ: ten@congty.vn)"),
    password: z.string().min(1, "Vui lòng nhập mật khẩu"),
    rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const forgotPasswordFormSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, "Vui lòng nhập địa chỉ email")
        .email("Định dạng email công việc không hợp lệ (ví dụ: ten@congty.vn)"),
});

export const otpVerificationSchema = z.object({
    otp: z
        .string()
        .length(6, "Vui lòng nhập đủ 6 chữ số mã xác thực")
        .regex(/^\d{6}$/, "Mã xác thực chỉ bao gồm các chữ số (0-9)"),
});

export type OtpVerificationFormData = z.infer<typeof otpVerificationSchema>;

export const PASSWORD_REGEX = {
    HAS_UPPERCASE: /[A-Z]/,
    HAS_LOWERCASE: /[a-z]/,
    HAS_NUMBER: /[0-9]/,
    HAS_SPECIAL: /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\/]/,
} as const;

export const newPasswordValidationRule = z
    .string()
    .min(8, "Mật khẩu phải có tối thiểu 8 ký tự")
    .regex(PASSWORD_REGEX.HAS_UPPERCASE, "Mật khẩu phải chứa ít nhất 1 chữ cái in hoa")
    .regex(PASSWORD_REGEX.HAS_LOWERCASE, "Mật khẩu phải chứa ít nhất 1 chữ cái in thường")
    .regex(PASSWORD_REGEX.HAS_NUMBER, "Mật khẩu phải chứa ít nhất 1 chữ số")
    .regex(PASSWORD_REGEX.HAS_SPECIAL, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt");

export const resetPasswordSchema = z
    .object({
        newPassword: newPasswordValidationRule,
        confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Mật khẩu xác nhận không trùng khớp",
        path: ["confirmPassword"],
    });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
        newPassword: newPasswordValidationRule,
        confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Mật khẩu xác nhận không trùng khớp",
        path: ["confirmPassword"],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: "Mật khẩu mới không được trùng với mật khẩu hiện tại",
        path: ["newPassword"],
    });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const evaluatePasswordRequirements = (password: string = ""): PasswordRequirement[] => {
    return [
        {
            id: "min-length",
            label: "Tối thiểu 8 ký tự",
            isMet: password.length >= 8,
        },
        {
            id: "has-uppercase",
            label: "Chứa ít nhất 1 chữ cái in hoa (A-Z)",
            isMet: PASSWORD_REGEX.HAS_UPPERCASE.test(password),
        },
        {
            id: "has-lowercase",
            label: "Chứa ít nhất 1 chữ cái in thường (a-z)",
            isMet: PASSWORD_REGEX.HAS_LOWERCASE.test(password),
        },
        {
            id: "has-number",
            label: "Chứa ít nhất 1 chữ số (0-9)",
            isMet: PASSWORD_REGEX.HAS_NUMBER.test(password),
        },
        {
            id: "has-special",
            label: "Chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*)",
            isMet: PASSWORD_REGEX.HAS_SPECIAL.test(password),
        },
    ];
};
