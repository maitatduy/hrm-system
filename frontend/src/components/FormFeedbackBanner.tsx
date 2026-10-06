import { AlertCircle, CheckCircle2, Info, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export type FeedbackType = "success" | "error" | "info";

export interface FormFeedback {
    readonly type: FeedbackType;
    readonly message: string;
}

export interface FormFeedbackBannerProps {
    readonly feedback: FormFeedback | null;
    readonly onClose?: () => void;
    readonly className?: string;
}

const VARIANTS: Record<FeedbackType, { readonly className: string; readonly icon: LucideIcon }> = {
    success: {
        className: "bg-accent-green/10 border-accent-green/30 text-accent-green",
        icon: CheckCircle2,
    },
    error: {
        className: "bg-accent-danger/10 border-accent-danger/30 text-accent-danger",
        icon: AlertCircle,
    },
    info: { className: "bg-primary/10 border-primary/30 text-primary", icon: Info },
};

export const FormFeedbackBanner = ({ feedback, onClose, className }: FormFeedbackBannerProps) => {
    if (!feedback) return null;

    const { className: variantClassName, icon: Icon } = VARIANTS[feedback.type];

    return (
        <div
            role={feedback.type === "error" ? "alert" : "status"}
            className={cn(
                "w-full p-3.5 flex items-start justify-between gap-2.5 rounded-xs border",
                variantClassName,
                className,
            )}
        >
            <div className="flex items-start gap-2.5">
                <Icon className="w-4.5 h-4.5 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-[14px] font-medium leading-snug">{feedback.message}</p>
            </div>
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Đóng thông báo"
                    className="p-0.5 rounded opacity-70 hover:opacity-100 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-current transition-opacity"
                >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
            )}
        </div>
    );
};
