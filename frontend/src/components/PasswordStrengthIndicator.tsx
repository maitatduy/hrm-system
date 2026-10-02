import { PasswordRequirementItem } from "./PasswordRequirementItem";
import type { PasswordStrengthIndicatorProps } from "@/features/auth/types";

export const PasswordStrengthIndicator = ({
    requirements,
    className = "",
}: PasswordStrengthIndicatorProps) => {
    return (
        <div
            className={`w-full bg-[#f6f5f4]/80 p-3 rounded-xs border border-[#e6e6e6]/60 flex flex-col gap-2 mt-1 ${className}`}
        >
            <p className="text-[12px] font-semibold text-[#31302e] tracking-tight">
                Yêu cầu mật khẩu an toàn:
            </p>
            <ul className="flex flex-col gap-1.5 list-none p-0 m-0">
                {requirements.map((req) => (
                    <PasswordRequirementItem key={req.id} requirement={req} />
                ))}
            </ul>
        </div>
    );
};
