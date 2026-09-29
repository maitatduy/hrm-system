import { AlertCircle, X } from "lucide-react";

export interface FormErrorMessageBannerProps {
    readonly message: string | null;
    readonly onClose?: () => void;
}

export const FormErrorMessageBanner = ({ message, onClose }: FormErrorMessageBannerProps) => {
    if (!message) return null;

    return (
        <div
            role="alert"
            className="w-full p-3.5 flex items-start justify-between gap-2.5 bg-[#dc2626]/5 border border-[#dc2626]/20 rounded-xs transition-all"
        >
            <div className="flex items-start gap-2.5">
                <AlertCircle
                    className="w-4.5 h-4.5 text-[#dc2626] shrink-0 mt-0.5"
                    aria-hidden="true"
                />
                <p className="text-[14px] font-medium text-[#dc2626] leading-snug">{message}</p>
            </div>
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    className="text-[#dc2626]/60 hover:text-[#dc2626] p-0.5 rounded transition-colors focus:outline-none"
                    aria-label="Đóng thông báo lỗi"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
};
