import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { LogoutDialogContainer } from "./LogoutDialogContainer";
import { useAuthStore } from "../store";

export const UserProfileContainer = () => {
    const sessionUser = useAuthStore((state) => state.sessionUser);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen]);

    const getInitials = (name?: string): string => {
        if (!name) return "NA";
        const parts = name.trim().split(" ");
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    return (
        <div className="relative inline-block" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="flex items-center gap-3.5 p-2 rounded-md hover:bg-[#f6f5f4] transition-colors cursor-pointer focus:outline-none"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
            >
                <div className="w-10 h-10 rounded-full bg-[#d5e3ff] flex items-center justify-center text-[#005db2] font-bold text-sm ring-1 ring-[#e6e6e6]">
                    {getInitials(sessionUser?.fullName)}
                </div>

                <div className="hidden md:flex flex-col text-left">
                    <span className="text-[15px] font-semibold text-[#000000] leading-tight">
                        {sessionUser?.fullName || "Nguyễn Văn An"}
                    </span>
                    <span className="text-[13px] text-[#615d59] leading-tight mt-1.5">
                        {sessionUser?.roles?.join(", ") || "Chuyên viên Quản trị"}
                    </span>
                </div>

                <ChevronDown className={`w-4.5 h-4.5 text-[#615d59] transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            <UserProfileDropdown
                isOpen={isDropdownOpen}
                user={sessionUser}
                onClose={() => setIsDropdownOpen(false)}
                onOpenLogoutModal={() => setIsLogoutModalOpen(true)}
            />

            <LogoutDialogContainer
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
            />
        </div>
    );
};

export default UserProfileContainer;
