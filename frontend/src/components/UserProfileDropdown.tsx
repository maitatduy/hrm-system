import { User, KeyRound, LogOut } from "lucide-react";
import type { AuthUserSession } from "@/features/auth/types";

export interface UserProfileDropdownProps {
    readonly isOpen: boolean;
    readonly user: AuthUserSession | null;
    readonly onClose: () => void;
    readonly onOpenLogoutModal: () => void;
}

export const UserProfileDropdown = ({
    isOpen,
    user,
    onClose,
    onOpenLogoutModal,
}: UserProfileDropdownProps) => {
    if (!isOpen) return null;

    return (
        <div className="absolute right-0 top-full mt-2 w-72 bg-[#ffffff] rounded-md border border-[#e6e6e6] shadow-[0_8px_28px_rgba(0,0,0,0.1)] py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-4.5 py-3 border-b border-[#e6e6e6]">
                <p className="text-[15px] font-semibold text-[#000000] truncate">
                    {user?.fullName || "Nguyễn Văn An"}
                </p>
                <p className="text-[13px] text-[#615d59] truncate mt-0.5">
                    {user?.email || "an.nguyen@hrmcorp.vn"}
                </p>
            </div>

            <div className="py-1.5">
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full flex items-center gap-3 px-4.5 py-2.5 text-[15px] text-[#000000] hover:bg-[#f6f5f4] transition-colors cursor-pointer text-left"
                >
                    <User className="w-4.5 h-4.5 text-[#615d59]" />
                    <span>Hồ sơ của tôi</span>
                </button>

                <button
                    type="button"
                    onClick={onClose}
                    className="w-full flex items-center gap-3 px-4.5 py-2.5 text-[15px] text-[#000000] hover:bg-[#f6f5f4] transition-colors cursor-pointer text-left"
                >
                    <KeyRound className="w-4.5 h-4.5 text-[#615d59]" />
                    <span>Đổi mật khẩu</span>
                </button>
            </div>

            <div className="my-1.5 h-[1px] w-full bg-[#e6e6e6]" />

            <div className="py-1">
                <button
                    type="button"
                    onClick={() => {
                        onClose();
                        onOpenLogoutModal();
                    }}
                    className="w-full flex items-center gap-3 px-4.5 py-2.5 text-[15px] font-medium text-[#dc2626] hover:bg-[#dc2626]/10 transition-colors cursor-pointer text-left"
                >
                    <LogOut className="w-4.5 h-4.5 text-[#dc2626]" />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </div>
    );
};

export default UserProfileDropdown;
