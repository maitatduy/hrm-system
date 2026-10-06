import { useEffect, type ReactNode } from "react";
import { AlertTriangle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";

export interface ConfirmDialogProps {
    readonly isOpen: boolean;
    readonly title: string;
    readonly description: string;
    readonly confirmLabel?: string;
    readonly cancelLabel?: string;
    readonly isLoading?: boolean;
    readonly variant?: "danger" | "primary";
    readonly icon?: LucideIcon;
    readonly onConfirm: () => void;
    readonly onCancel: () => void;
    readonly children?: ReactNode;
}

export const ConfirmDialog = ({
    isOpen,
    title,
    description,
    confirmLabel = "Xác nhận",
    cancelLabel = "Hủy bỏ",
    isLoading = false,
    variant = "danger",
    icon: Icon = AlertTriangle,
    onConfirm,
    onCancel,
    children,
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

    const isDanger = variant === "danger";

    return (
        <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={(event) => {
                if (event.target === event.currentTarget && !isLoading) onCancel();
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
        >
            <div className="w-full max-w-[480px] bg-surface rounded-lg border border-hairline shadow-[0_16px_36px_rgba(0,0,0,0.14)] p-8">
                <div className="flex justify-center">
                    <div
                        className={cn(
                            "w-14 h-14 rounded-full flex items-center justify-center ring-8",
                            isDanger
                                ? "bg-accent-danger/10 text-accent-danger ring-accent-danger/5"
                                : "bg-primary/10 text-primary ring-primary/5",
                        )}
                    >
                        <Icon className="w-7 h-7 stroke-[2.2]" aria-hidden="true" />
                    </div>
                </div>

                <h2
                    id="confirm-dialog-title"
                    className="text-[24px] font-bold text-center text-ink mt-5 tracking-tight leading-tight"
                >
                    {title}
                </h2>

                <p
                    id="confirm-dialog-description"
                    className="text-[16px] text-ink-muted text-center leading-relaxed mt-3 mb-6"
                >
                    {description}
                </p>

                {children}

                <div className="flex items-center justify-end gap-3.5 pt-3">
                    <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={isDanger ? "danger" : "primary"}
                        onClick={onConfirm}
                        isLoading={isLoading}
                        className={isDanger ? undefined : "h-11 rounded-md"}
                    >
                        <Icon className="w-4.5 h-4.5" aria-hidden="true" />
                        <span>{confirmLabel}</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};
