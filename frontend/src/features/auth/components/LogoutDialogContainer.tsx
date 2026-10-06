import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useLogoutMutation } from "../hooks/useLogoutMutation";

export interface LogoutDialogContainerProps {
    readonly isOpen: boolean;
    readonly onClose: () => void;
}

export const LogoutDialogContainer = ({ isOpen, onClose }: LogoutDialogContainerProps) => {
    const logoutMutation = useLogoutMutation("logged_out");

    return (
        <ConfirmDialog
            isOpen={isOpen}
            title="Đăng xuất?"
            confirmLabel="Đăng xuất"
            variant="danger"
            isLoading={logoutMutation.isPending}
            onConfirm={() => logoutMutation.mutate()}
            onCancel={onClose}
        />
    );
};
