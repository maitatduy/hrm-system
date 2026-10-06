import { LayoutDashboard, Settings, type LucideIcon } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/cn";
import { UserMenu } from "@/features/auth/components/UserMenu";
import { useAuthStore } from "@/features/auth/store";
import { getHomePathByRole } from "@/features/auth/utils";

interface NavItem {
    readonly label: string;
    readonly to: string;
    readonly icon: LucideIcon;
}

// Chỉ liệt kê các mục đã có trang, module mới sẽ được thêm vào đây khi hoàn thành
const buildNavItems = (homePath: string): readonly NavItem[] => [
    { label: "Tổng quan", to: homePath, icon: LayoutDashboard },
    { label: "Cài đặt", to: "/settings", icon: Settings },
];

const NAV_ITEM_CLASS_NAME =
    "flex items-center gap-3 px-3 py-2 rounded-md text-[14px] transition-colors";

/** Khung chung cho các trang sau đăng nhập. Chỉ dùng bên trong ProtectedRoute nên luôn có sessionUser. */
export const DashboardLayout = () => {
    const role = useAuthStore((state) => state.sessionUser?.role) ?? "EMPLOYEE";
    const homePath = getHomePathByRole(role);
    const navItems = buildNavItems(homePath);

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
                        {navItems.map((item) => (
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
                                <item.icon
                                    className="w-[18px] h-[18px] shrink-0"
                                    aria-hidden="true"
                                />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </aside>

                <main className="flex-1 p-6 flex flex-col gap-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
