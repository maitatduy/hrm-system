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
