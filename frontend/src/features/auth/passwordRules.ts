export type PasswordRuleId =
    "min-length" | "has-uppercase" | "has-lowercase" | "has-number" | "has-special";

interface PasswordRule {
    readonly id: PasswordRuleId;
    /** Hiển thị trong danh sách yêu cầu dưới ô mật khẩu mới. */
    readonly label: string;
    /** Hiển thị như lỗi validate khi quy tắc chưa đạt. */
    readonly message: string;
    readonly test: (password: string) => boolean;
}

export interface PasswordRequirement {
    readonly id: PasswordRuleId;
    readonly label: string;
    readonly isMet: boolean;
}

export const PASSWORD_MAX_LENGTH = 100;

/** Nguồn duy nhất cho quy tắc mật khẩu, dùng chung cho zod schema và danh sách yêu cầu trên UI. */
export const PASSWORD_RULES: readonly PasswordRule[] = [
    {
        id: "min-length",
        label: "Tối thiểu 8 ký tự",
        message: "Mật khẩu phải có tối thiểu 8 ký tự",
        test: (password) => password.length >= 8,
    },
    {
        id: "has-uppercase",
        label: "Chứa ít nhất 1 chữ cái in hoa (A-Z)",
        message: "Mật khẩu phải chứa ít nhất 1 chữ cái in hoa",
        test: (password) => /[A-Z]/.test(password),
    },
    {
        id: "has-lowercase",
        label: "Chứa ít nhất 1 chữ cái in thường (a-z)",
        message: "Mật khẩu phải chứa ít nhất 1 chữ cái in thường",
        test: (password) => /[a-z]/.test(password),
    },
    {
        id: "has-number",
        label: "Chứa ít nhất 1 chữ số (0-9)",
        message: "Mật khẩu phải chứa ít nhất 1 chữ số",
        test: (password) => /[0-9]/.test(password),
    },
    {
        id: "has-special",
        label: "Chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*)",
        message: "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt",
        test: (password) => /[^A-Za-z0-9\s]/.test(password),
    },
];

export const evaluatePasswordRequirements = (password = ""): PasswordRequirement[] =>
    PASSWORD_RULES.map(({ id, label, test }) => ({ id, label, isMet: test(password) }));
