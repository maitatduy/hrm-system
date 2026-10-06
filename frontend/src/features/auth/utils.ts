import type { UserRole } from "./types";

export const ROLE_LABELS: Record<UserRole, string> = {
    ADMIN: "Quản trị viên",
    HR: "Nhân sự",
    MANAGER: "Quản lý",
    EMPLOYEE: "Nhân viên",
};

export const getHomePathByRole = (role: UserRole): string => {
    if (role === "ADMIN" || role === "HR") return "/dashboard";
    if (role === "MANAGER") return "/management/dashboard";
    return "/portal/dashboard";
};

/** Chỉ chấp nhận path nội bộ, chặn open redirect dạng "//evil.com" hoặc "/\evil.com". */
export const getSafeRedirectPath = (redirect: string | null): string | null => {
    if (!redirect?.startsWith("/") || redirect.startsWith("//") || redirect.startsWith("/\\")) {
        return null;
    }
    return redirect;
};

export const getInitialsFromEmail = (email?: string): string => {
    if (!email) return "NA";
    return email.split("@")[0].slice(0, 2).toUpperCase();
};

/** Che bớt phần tên của email, ví dụ "nguyenvana@hrm.vn" thành "ng***a@hrm.vn". */
export const maskEmail = (email: string): string => {
    const atIndex = email.lastIndexOf("@");
    if (atIndex <= 0) return email;

    const name = email.slice(0, atIndex);
    const domain = email.slice(atIndex + 1);
    if (name.length <= 3) return `${name[0]}***@${domain}`;
    return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`;
};
