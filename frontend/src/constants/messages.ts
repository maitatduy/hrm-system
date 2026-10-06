/** Thông báo lỗi validate hiển thị dưới ô nhập. */
export const VALIDATION_MESSAGES = {
    EMAIL_REQUIRED: "Nhập email",
    EMAIL_INVALID: "Email không hợp lệ",
    PASSWORD_REQUIRED: "Nhập mật khẩu",
    CURRENT_PASSWORD_REQUIRED: "Nhập mật khẩu hiện tại",
    CONFIRM_PASSWORD_REQUIRED: "Nhập lại mật khẩu",
    PASSWORD_MISMATCH: "Mật khẩu không khớp",
    PASSWORD_SAME_AS_CURRENT: "Phải khác mật khẩu hiện tại",
    PASSWORD_WEAK: "Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
    passwordTooLong: (maxLength: number) => `Tối đa ${maxLength} ký tự`,
    otpIncomplete: (length: number) => `Nhập đủ ${length} số`,
} as const;

/** Thông báo kết quả của các luồng xác thực. */
export const AUTH_MESSAGES = {
    LOGGED_OUT: "Đã đăng xuất",
    PASSWORD_RESET: "Đã đặt lại mật khẩu",
    PASSWORD_CHANGED: "Đã đổi mật khẩu, vui lòng đăng nhập lại",
    SESSION_LOADING: "Đang tải...",
    SESSION_LOAD_FAILED: "Không tải được phiên đăng nhập",
} as const;

/** Lỗi dự phòng khi backend không trả về message. */
export const ERROR_MESSAGES = {
    SERVER_UNREACHABLE: "Không kết nối được máy chủ",
    EMPTY_RESPONSE: "Phản hồi từ máy chủ không chứa dữ liệu",
} as const;
