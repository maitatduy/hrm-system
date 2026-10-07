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
    PASSWORD_TOO_LONG: "Mật khẩu quá dài, tối đa 72 byte (khoảng 72 ký tự không dấu)",
    otpIncomplete: (length: number) => `Nhập đủ ${length} số`,
} as const;

/** Thông báo kết quả của các luồng xác thực. */
export const AUTH_MESSAGES = {
    LOGGED_OUT: "Đã đăng xuất",
    PASSWORD_RESET: "Đã đặt lại mật khẩu",
    PASSWORD_CHANGED: "Đã đổi mật khẩu, vui lòng đăng nhập lại",
    SESSION_LOADING: "Đang tải...",
    SESSION_LOAD_FAILED: "Không tải được phiên đăng nhập",
    LOGOUT_CONFIRM_TITLE: "Đăng xuất khỏi hệ thống?",
    LOGOUT_CONFIRM_DEFAULT: "Bạn sẽ cần đăng nhập lại để tiếp tục làm việc.",
    logoutConfirm: (email: string) =>
        `Phiên làm việc của ${email} sẽ kết thúc. Bạn sẽ cần đăng nhập lại để tiếp tục làm việc.`,
} as const;

/** Nhãn và thông báo của màn hình tổng quan. */
export const DASHBOARD_MESSAGES = {
    PAGE_TITLE: "Tổng quan",
    METRIC_TOTAL_EMPLOYEES: "Tổng nhân viên",
    METRIC_PRESENT_TODAY: "Đi làm hôm nay",
    METRIC_ON_LEAVE_TODAY: "Đang nghỉ phép",
    METRIC_OPEN_POSITIONS: "Vị trí đang tuyển",
    ATTENDANCE_TREND_TITLE: "Tỷ lệ chuyên cần 6 tháng",
    DEPARTMENT_DISTRIBUTION_TITLE: "Nhân viên theo phòng ban",
    DEPARTMENT_DISTRIBUTION_UNIT: "nhân viên",
    RECENT_ACTIVITIES_TITLE: "Hoạt động gần đây",
    UPCOMING_EVENTS_TITLE: "Sự kiện sắp tới",
    LOAD_FAILED: "Không tải được dữ liệu",
    RETRY: "Thử lại",
    EMPTY_CHART: "Chưa có dữ liệu",
    EMPTY_ACTIVITIES: "Chưa có hoạt động nào",
    EMPTY_EVENTS: "Không có sự kiện sắp tới",
    ALL_DAY: "Cả ngày",
} as const;

/** Lỗi dự phòng khi backend không trả về message. */
export const ERROR_MESSAGES = {
    SERVER_UNREACHABLE: "Không kết nối được máy chủ",
    EMPTY_RESPONSE: "Phản hồi từ máy chủ không chứa dữ liệu",
} as const;
