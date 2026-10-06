import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export type FeedbackType = "success" | "error";

export interface FormFeedback {
    readonly type: FeedbackType;
    readonly message: string;
}

export interface FormFeedbackBannerProps {
    readonly feedback: FormFeedback | null;
    readonly onClose?: () => void;
    readonly className?: string;
}

const VARIANT_CLASS_NAMES: Record<FeedbackType, string> = {
    success: "bg-accent-green/10 text-accent-green",
    error: "bg-accent-danger/10 text-accent-danger",
};

export const FormFeedbackBanner = ({ feedback, onClose, className }: FormFeedbackBannerProps) => {
    if (!feedback) return null;

    return (
        <div
            role={feedback.type === "error" ? "alert" : "status"}
            className={cn(
                "w-full px-3.5 py-2.5 flex items-center justify-between gap-2.5 rounded-xs",
                VARIANT_CLASS_NAMES[feedback.type],
                className,
            )}
        >
            <p className="text-[14px] font-medium leading-snug">{feedback.message}</p>
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Đóng"
                    className="p-0.5 rounded opacity-70 hover:opacity-100 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-current transition-opacity"
                >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
            )}
        </div>
    );
};
