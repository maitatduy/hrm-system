import { useEffect } from "react";
import { LogOut, AlertTriangle } from "lucide-react";
import { SecondaryButton } from "./SecondaryButton";
import { DangerButton } from "./DangerButton";
import type { ConfirmDialogProps } from "@/features/auth/types";

export const ConfirmDialog = ({
    isOpen,
    title,
    description,
    confirmLabel = "Xác nhận",
    cancelLabel = "Hủy bỏ",
    isLoading = false,
    variant = "danger",
    onConfirm,
    onCancel,
    children,
}: ConfirmDialogProps) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen && !isLoading) {
                onCancel();
            }
        };

        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, isLoading, onCancel]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity duration-200"
            onClick={(e) => {
                if (e.target === e.currentTarget && !isLoading) {
                    onCancel();
                }
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
        >
            <div
                className="relative z-10 bg-[#ffffff] w-full max-w-[480px] rounded-lg border border-[#e6e6e6] shadow-[0_16px_36px_rgba(0,0,0,0.14)] p-8 transform transition-all duration-200 scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-center">
                    <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center ring-8 ${
                            variant === "danger"
                                ? "bg-[#dc2626]/10 text-[#dc2626] ring-[#dc2626]/5"
                                : "bg-[#0075de]/10 text-[#0075de] ring-[#0075de]/5"
                        }`}
                    >
                        {variant === "danger" ? (
                            <LogOut className="w-7 h-7 stroke-[2.2]" />
                        ) : (
                            <AlertTriangle className="w-7 h-7 stroke-[2.2]" />
                        )}
                    </div>
                </div>

                <h2
                    id="confirm-dialog-title"
                    className="text-[24px] font-bold text-center text-[#000000] mt-5 tracking-tight leading-tight"
                >
                    {title}
                </h2>

                <p
                    id="confirm-dialog-description"
                    className="text-[16px] font-normal text-[#615d59] text-center leading-relaxed mt-3 mb-6"
                >
                    {description}
                </p>

                {children}

                <div className="flex items-center justify-end gap-3.5 pt-3">
                    <SecondaryButton
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </SecondaryButton>

                    <DangerButton
                        onClick={onConfirm}
                        isLoading={isLoading}
                        disabled={isLoading}
                    >
                        <LogOut className="w-4.5 h-4.5" />
                        <span>{isLoading ? "Đang xử lý..." : confirmLabel}</span>
                    </DangerButton>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
