import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface FormFeedbackBannerProps {
    readonly type: "success" | "error" | "info";
    readonly message: string | null;
    readonly onClose?: () => void;
    readonly className?: string;
}

export const FormFeedbackBanner = ({
    type,
    message,
    onClose,
    className = "",
}: FormFeedbackBannerProps) => {
    if (!message) return null;

    const variantStyles = {
        success: {
            bg: "bg-[#1aae39]/10",
            border: "border-[#1aae39]/30",
            text: "text-[#1aae39]",
            icon: CheckCircle2,
        },
        error: {
            bg: "bg-[#dc2626]/10",
            border: "border-[#dc2626]/30",
            text: "text-[#dc2626]",
            icon: AlertCircle,
        },
        info: {
            bg: "bg-[#0075de]/10",
            border: "border-[#0075de]/30",
            text: "text-[#0075de]",
            icon: Info,
        },
    }[type];

    const Icon = variantStyles.icon;

    return (
        <div
            role="alert"
            className={`w-full p-3.5 flex items-start justify-between gap-2.5 rounded-xs border transition-all ${variantStyles.bg} ${variantStyles.border} ${className}`}
        >
            <div className="flex items-start gap-2.5">
                <Icon
                    className={`w-4.5 h-4.5 shrink-0 mt-0.5 ${variantStyles.text}`}
                    aria-hidden="true"
                />
                <p className={`text-[14px] font-medium leading-snug ${variantStyles.text}`}>
                    {message}
                </p>
            </div>
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    className={`p-0.5 rounded transition-colors focus:outline-none opacity-70 hover:opacity-100 cursor-pointer ${variantStyles.text}`}
                    aria-label="Đóng thông báo"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
};
