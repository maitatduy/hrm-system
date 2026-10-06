import { ConfirmDialog } from "@/components/ConfirmDialog";
import { AUTH_MESSAGES } from "@/constants/messages";
import { useAuthStore } from "../store";
import { useLogoutMutation } from "../hooks/useLogoutMutation";

export interface LogoutDialogContainerProps {
    readonly isOpen: boolean;
    readonly onClose: () => void;
}

export const LogoutDialogContainer = ({ isOpen, onClose }: LogoutDialogContainerProps) => {
    const email = useAuthStore((state) => state.sessionUser?.email);
    const logoutMutation = useLogoutMutation("logged_out");

    return (
        <ConfirmDialog
            isOpen={isOpen}
            title={AUTH_MESSAGES.LOGOUT_CONFIRM_TITLE}
            description={
                email ? AUTH_MESSAGES.logoutConfirm(email) : AUTH_MESSAGES.LOGOUT_CONFIRM_DEFAULT
            }
            confirmLabel="Đăng xuất"
            variant="danger"
            isLoading={logoutMutation.isPending}
            onConfirm={() => logoutMutation.mutate()}
            onCancel={onClose}
        />
    );
};
