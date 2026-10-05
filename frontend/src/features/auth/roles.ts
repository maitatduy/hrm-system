import type { UserRole } from "./types";

export const ROLE_LABELS: Record<UserRole, string> = {
    ADMIN: "Quản trị viên",
    HR: "Nhân sự",
    MANAGER: "Quản lý",
    EMPLOYEE: "Nhân viên",
};

export const getHomePathByRole = (role: UserRole): string => {
    if (role === "ADMIN" || role === "HR") {
        return "/dashboard";
    }
    if (role === "MANAGER") {
        return "/management/dashboard";
    }
    return "/portal/dashboard";
};

/** Chỉ chấp nhận path nội bộ, chặn open redirect dạng "//evil.com" hoặc "/\evil.com". */
export const getSafeRedirectPath = (redirect: string | null): string | null => {
    if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//") || redirect.startsWith("/\\")) {
        return null;
    }
    return redirect;
};

export const getInitialsFromEmail = (email?: string): string => {
    if (!email) return "NA";
    return email.split("@")[0].substring(0, 2).toUpperCase();
};
