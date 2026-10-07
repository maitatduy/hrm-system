// Khớp PasswordPolicy.MAX_BYTES ở auth-service: BCrypt chỉ dùng 72 byte đầu của mật khẩu.
// Tính theo byte UTF-8, chữ tiếng Việt có dấu chiếm 2 đến 3 byte.
export const PASSWORD_MAX_BYTES = 72;

const utf8Encoder = new TextEncoder();

export const isWithinPasswordByteLimit = (password: string): boolean =>
    utf8Encoder.encode(password).length <= PASSWORD_MAX_BYTES;

/** Quy tắc mật khẩu mạnh, thông báo tương ứng là VALIDATION_MESSAGES.PASSWORD_WEAK. */
const PASSWORD_RULES: readonly ((password: string) => boolean)[] = [
    (password) => password.length >= 8,
    (password) => /[A-Z]/.test(password),
    (password) => /[a-z]/.test(password),
    (password) => /[0-9]/.test(password),
    (password) => /[^A-Za-z0-9\s]/.test(password),
];

export const isStrongPassword = (password: string): boolean =>
    PASSWORD_RULES.every((rule) => rule(password));
