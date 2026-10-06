import { LogOut } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAuthStore } from "../store";
import { useLogoutMutation } from "../hooks/useLogoutMutation";
import { UserAvatar, UserIdentity } from "./UserAvatar";

export interface LogoutDialogContainerProps {
    readonly isOpen: boolean;
    readonly onClose: () => void;
}

export const LogoutDialogContainer = ({ isOpen, onClose }: LogoutDialogContainerProps) => {
    const sessionUser = useAuthStore((state) => state.sessionUser);
    const logoutMutation = useLogoutMutation("logged_out");

    return (
        <ConfirmDialog
            isOpen={isOpen}
            title="Xác nhận đăng xuất"
            description="Bạn có chắc chắn muốn kết thúc phiên làm việc? Mọi tác vụ chưa lưu sẽ bị gián đoạn và bạn cần đăng nhập lại để tiếp tục."
            confirmLabel="Đăng xuất"
            variant="danger"
            icon={LogOut}
            isLoading={logoutMutation.isPending}
            onConfirm={() => logoutMutation.mutate()}
            onCancel={onClose}
        >
            <div className="bg-canvas-warm border border-hairline rounded-md p-4 mb-6 flex items-center gap-3.5">
                <UserAvatar email={sessionUser?.email} className="w-11 h-11" />
                <UserIdentity user={sessionUser} />
            </div>
        </ConfirmDialog>
    );
};
