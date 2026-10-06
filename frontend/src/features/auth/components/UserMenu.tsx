import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "@/components/Avatar";
import { cn } from "@/lib/cn";
import { useAuthStore } from "../store";
import { LogoutDialogContainer } from "./LogoutDialogContainer";
import { UserIdentity } from "./UserAvatar";

const MENU_ITEM_CLASS_NAME =
    "block w-full px-4 py-2.5 text-[15px] text-left cursor-pointer transition-colors outline-none hover:bg-canvas-soft focus-visible:bg-canvas-soft";

/** Ảnh đại diện trên header: mở menu tài khoản và hộp thoại xác nhận đăng xuất. */
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

    return (
        <div className="relative inline-block" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                aria-expanded={isMenuOpen}
                aria-haspopup="menu"
                aria-label="Tài khoản"
                className="rounded-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
                <Avatar email={sessionUser?.email} />
            </button>

            {isMenuOpen && (
                <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-64 bg-surface rounded-md border border-hairline shadow-[0_8px_28px_rgba(0,0,0,0.1)] py-1.5 z-50"
                >
                    <UserIdentity
                        user={sessionUser}
                        className="px-4 py-2.5 border-b border-hairline mb-1.5"
                    />
                    <Link
                        to="/settings"
                        role="menuitem"
                        onClick={() => setIsMenuOpen(false)}
                        className={cn(MENU_ITEM_CLASS_NAME, "text-ink")}
                    >
                        Đổi mật khẩu
                    </Link>
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                            setIsMenuOpen(false);
                            setIsLogoutDialogOpen(true);
                        }}
                        className={cn(MENU_ITEM_CLASS_NAME, "text-accent-danger")}
                    >
                        Đăng xuất
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
