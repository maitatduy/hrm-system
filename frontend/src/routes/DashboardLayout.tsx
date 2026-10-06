import { Link, NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/cn";
import { UserMenu } from "@/features/auth/components/UserMenu";
import { useAuthStore } from "@/features/auth/store";
import { getHomePathByRole } from "@/features/auth/utils";
import type { UserRole } from "@/features/auth/types";

interface NavItem {
    readonly label: string;
    /** Bỏ trống nghĩa là tính năng chưa có, hiển thị dạng vô hiệu hóa. */
    readonly to?: string;
    readonly roles?: readonly UserRole[];
}

const buildNavItems = (homePath: string): readonly NavItem[] => [
    { label: "Tổng quan", to: homePath },
    { label: "Hồ sơ nhân viên" },
    { label: "Chấm công" },
    { label: "Nghỉ phép" },
    { label: "Bảng lương", roles: ["ADMIN", "HR"] },
    { label: "Cài đặt", to: "/settings" },
];

const NAV_ITEM_CLASS_NAME = "px-3 py-2 rounded-md text-[14px] transition-colors";

/** Khung chung cho các trang sau đăng nhập. Chỉ dùng bên trong ProtectedRoute nên luôn có sessionUser. */
export const DashboardLayout = () => {
    const role = useAuthStore((state) => state.sessionUser?.role) ?? "EMPLOYEE";
    const homePath = getHomePathByRole(role);
    const navItems = buildNavItems(homePath).filter(
        (item) => !item.roles || item.roles.includes(role),
    );

    return (
        <div className="min-h-screen bg-canvas-soft flex flex-col">
            <header className="fixed top-0 left-0 w-full z-40 flex items-center justify-between px-6 h-16 bg-surface border-b border-hairline shadow-xs">
                <Link
                    to={homePath}
                    className="font-bold text-[18px] tracking-tight text-ink select-none"
                >
                    HRM System
                </Link>
                <UserMenu />
            </header>

            <div className="pt-16 flex flex-1">
                <aside className="w-64 bg-surface border-r border-hairline p-4 hidden md:block">
                    <nav aria-label="Điều hướng chính" className="flex flex-col gap-1">
                        {navItems.map((item) =>
                            item.to ? (
                                <NavLink
                                    key={item.label}
                                    to={item.to}
                                    end
                                    className={({ isActive }) =>
                                        cn(
                                            NAV_ITEM_CLASS_NAME,
                                            "outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                                            isActive
                                                ? "bg-primary/10 text-primary font-semibold"
                                                : "text-ink-secondary hover:bg-canvas-soft",
                                        )
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            ) : (
                                <span
                                    key={item.label}
                                    aria-disabled="true"
                                    title="Tính năng đang được phát triển"
                                    className={cn(
                                        NAV_ITEM_CLASS_NAME,
                                        "text-ink-faint cursor-not-allowed select-none",
                                    )}
                                >
                                    {item.label}
                                </span>
                            ),
                        )}
                    </nav>
                </aside>

                <main className="flex-1 p-6 flex flex-col gap-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
