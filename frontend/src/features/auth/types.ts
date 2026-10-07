import type { ApiMessageResponse } from "@/lib/apiError";

export type UserRole = "ADMIN" | "HR" | "MANAGER" | "EMPLOYEE";

export type UserStatus = "ACTIVE" | "LOCKED";

/** Khớp với UserSummaryResponse của auth-service. Thời gian là UTC. */
export interface AuthUserSession {
    readonly id: string;
    readonly email: string;
    readonly role: UserRole;
    readonly status: UserStatus;
    readonly employeeId: string | null;
    readonly lastLoginAt: string | null;
}

export interface LoginRequest {
    readonly email: string;
    readonly password: string;
    /** Backend dùng để chọn cookie lưu bền (true) hay cookie phiên (false) cho refresh token. */
    readonly rememberMe: boolean;
}

export interface LoginResponse {
    readonly accessToken: string;
    readonly tokenType: "Bearer";
    readonly user: AuthUserSession;
}

export interface ForgotPasswordRequest {
    readonly email: string;
}

export interface VerifyOtpRequest {
    readonly email: string;
    readonly otp: string;
}

export interface VerifyOtpResponse {
    readonly resetToken: string;
}

export interface ResetPasswordRequest {
    readonly resetToken: string;
    readonly newPassword: string;
}

export interface ChangePasswordRequest {
    readonly currentPassword: string;
    readonly newPassword: string;
}

export type MessageResponse = ApiMessageResponse;

/** Dữ liệu truyền từ bước xác thực OTP sang trang đặt lại mật khẩu qua history state. */
export interface ResetPasswordLocationState {
    readonly email: string;
    readonly resetToken: string;
}

/** Lý do quay về trang đăng nhập, dùng để hiển thị thông báo phù hợp. */
export type LoginRedirectReason = "logged_out" | "password_reset" | "password_changed";

/**
 * restoring: đang khôi phục phiên bằng cookie refresh token lúc tải trang, chưa biết đã đăng nhập hay chưa.
 * authenticated: có access token trong bộ nhớ. anonymous: chưa đăng nhập hoặc đã đăng xuất.
 */
export type SessionStatus = "restoring" | "authenticated" | "anonymous";

export interface AuthState {
    /** Chỉ nằm trong bộ nhớ, không bao giờ ghi vào localStorage hay sessionStorage. */
    readonly accessToken: string | null;
    readonly status: SessionStatus;
    readonly isAuthenticated: boolean;
    /**
     * Lý do phiên vừa kết thúc do người dùng chủ động (đăng xuất, đổi mật khẩu), để ProtectedRoute đưa về trang đăng
     * nhập kèm thông báo. null khi phiên hết hạn hoặc bị thu hồi, lúc đó giữ ?redirect để quay lại đúng trang.
     */
    readonly signOutReason: LoginRedirectReason | null;
    readonly sessionUser: AuthUserSession | null;
    readonly setAuth: (payload: { accessToken: string; user: AuthUserSession }) => void;
    readonly setAccessToken: (accessToken: string) => void;
    readonly setSessionUser: (user: AuthUserSession) => void;
    readonly clearAuth: (reason?: LoginRedirectReason) => void;
}
