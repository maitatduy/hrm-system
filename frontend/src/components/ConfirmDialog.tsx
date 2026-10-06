import { useEffect } from "react";
import { Button } from "./Button";

export interface ConfirmDialogProps {
    readonly isOpen: boolean;
    readonly title: string;
    readonly description?: string;
    readonly confirmLabel?: string;
    readonly cancelLabel?: string;
    readonly isLoading?: boolean;
    readonly variant?: "danger" | "primary";
    readonly onConfirm: () => void;
    readonly onCancel: () => void;
}

export const ConfirmDialog = ({
    isOpen,
    title,
    description,
    confirmLabel = "Xác nhận",
    cancelLabel = "Hủy",
    isLoading = false,
    variant = "danger",
    onConfirm,
    onCancel,
}: ConfirmDialogProps) => {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !isLoading) onCancel();
        };
        const previousOverflow = document.body.style.overflow;

        window.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen, isLoading, onCancel]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={(event) => {
                if (event.target === event.currentTarget && !isLoading) onCancel();
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby={description ? "confirm-dialog-description" : undefined}
        >
            <div className="w-full max-w-[400px] bg-surface rounded-lg border border-hairline shadow-[0_16px_36px_rgba(0,0,0,0.14)] p-6">
                <h2 id="confirm-dialog-title" className="text-[20px] font-bold text-ink">
                    {title}
                </h2>
                {description && (
                    <p id="confirm-dialog-description" className="text-[15px] text-ink-muted mt-2">
                        {description}
                    </p>
                )}
                <div className="flex items-center justify-end gap-3 mt-6">
                    <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={variant === "danger" ? "danger" : "primary"}
                        onClick={onConfirm}
                        isLoading={isLoading}
                        className={variant === "danger" ? undefined : "h-11 rounded-md"}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
};
