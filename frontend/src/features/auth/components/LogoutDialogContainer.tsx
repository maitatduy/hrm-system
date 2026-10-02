import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAuthStore } from "../store";
import { useLogoutMutation } from "../hooks/useLogoutMutation";

export interface LogoutDialogContainerProps {
    readonly isOpen: boolean;
    readonly onClose: () => void;
}

export const LogoutDialogContainer = ({ isOpen, onClose }: LogoutDialogContainerProps) => {
    const sessionUser = useAuthStore((state) => state.sessionUser);
    const logoutMutation = useLogoutMutation(onClose);

    const getInitials = (name?: string): string => {
        if (!name) return "NA";
        const parts = name.trim().split(" ");
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    return (
        <ConfirmDialog
            isOpen={isOpen}
            title="Xác nhận đăng xuất"
            description="Bạn có chắc chắn muốn kết thúc phiên làm việc? Mọi tác vụ chưa lưu sẽ bị gián đoạn và bạn cần đăng nhập lại để tiếp tục."
            confirmLabel="Đăng xuất"
            cancelLabel="Hủy bỏ"
            variant="danger"
            isLoading={logoutMutation.isPending}
            onConfirm={() => {
                logoutMutation.mutate();
            }}
            onCancel={onClose}
        >
            <div className="bg-[#f9f2ed] border border-[#e6e6e6] rounded-md p-4 mb-6 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#d5e3ff] flex items-center justify-center text-[#005db2] font-bold text-sm shrink-0">
                    {getInitials(sessionUser?.fullName)}
                </div>
                <div className="flex flex-col text-left overflow-hidden">
                    <span className="text-[15px] text-[#000000] font-semibold truncate">
                        {sessionUser?.fullName || "Nguyễn Văn An"}
                    </span>
                    <span className="text-[13px] text-[#615d59] truncate mt-0.5">
                        {sessionUser?.email || "Chuyên viên Quản trị Nhân sự - Ban Nhân sự & Tiền lương"}
                    </span>
                </div>
            </div>
        </ConfirmDialog>
    );
};

export default LogoutDialogContainer;
