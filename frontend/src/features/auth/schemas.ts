import { z } from "zod";

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
