import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, KeyRound, LogOut, User } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuthStore } from "../store";
import { LogoutDialogContainer } from "./LogoutDialogContainer";
import { UserAvatar, UserIdentity } from "./UserAvatar";

const MENU_ITEM_CLASS_NAME =
    "w-full flex items-center gap-3 px-4.5 py-2.5 text-[15px] text-left cursor-pointer transition-colors outline-none focus-visible:bg-canvas-soft";

/** Nút người dùng trên header: mở menu tài khoản và hộp thoại xác nhận đăng xuất. */
export const UserMenu = () => {
    const sessionUser = useAuthStore((state) => state.sessionUser);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isMenuOpen) return;

        const handlePointerDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) setIsMenuOpen(false);
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsMenuOpen(false);
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isMenuOpen]);

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <div className="relative inline-block" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                aria-expanded={isMenuOpen}
                aria-haspopup="menu"
                aria-label="Mở menu tài khoản"
                className="flex items-center gap-3.5 p-2 rounded-md hover:bg-canvas-soft cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
                <UserAvatar email={sessionUser?.email} className="ring-1 ring-hairline" />
                <UserIdentity user={sessionUser} className="hidden md:flex max-w-56" />
                <ChevronDown
                    aria-hidden="true"
                    className={cn(
                        "w-4.5 h-4.5 text-ink-muted transition-transform duration-200",
                        isMenuOpen && "rotate-180",
                    )}
                />
            </button>

            {isMenuOpen && (
                <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-72 bg-surface rounded-md border border-hairline shadow-[0_8px_28px_rgba(0,0,0,0.1)] py-2 z-50"
                >
                    <UserIdentity
                        user={sessionUser}
                        className="px-4.5 py-3 border-b border-hairline"
                    />

                    <div className="py-1.5">
                        {/* Trang hồ sơ sẽ có khi employee-service được triển khai */}
                        <button
                            type="button"
                            role="menuitem"
                            disabled
                            title="Tính năng đang được phát triển"
                            className={cn(
                                MENU_ITEM_CLASS_NAME,
                                "text-ink-faint cursor-not-allowed",
                            )}
                        >
                            <User className="w-4.5 h-4.5" aria-hidden="true" />
                            <span>Hồ sơ của tôi</span>
                        </button>
                        <Link
                            to="/settings"
                            role="menuitem"
                            onClick={closeMenu}
                            className={cn(MENU_ITEM_CLASS_NAME, "text-ink hover:bg-canvas-soft")}
                        >
                            <KeyRound className="w-4.5 h-4.5 text-ink-muted" aria-hidden="true" />
                            <span>Đổi mật khẩu</span>
                        </Link>
                    </div>

                    <div className="my-1.5 h-px w-full bg-hairline" />

                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                            closeMenu();
                            setIsLogoutDialogOpen(true);
                        }}
                        className={cn(
                            MENU_ITEM_CLASS_NAME,
                            "font-medium text-accent-danger hover:bg-accent-danger/10",
                        )}
                    >
                        <LogOut className="w-4.5 h-4.5" aria-hidden="true" />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            )}

            <LogoutDialogContainer
                isOpen={isLogoutDialogOpen}
                onClose={() => setIsLogoutDialogOpen(false)}
            />
        </div>
    );
};
