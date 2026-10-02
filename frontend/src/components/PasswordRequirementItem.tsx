import { Check, Circle } from "lucide-react";
import type { PasswordRequirementItemProps } from "@/features/auth/types";

export const PasswordRequirementItem = ({
    requirement,
    className = "",
}: PasswordRequirementItemProps) => {
    const { label, isMet } = requirement;

    return (
        <li
            className={`flex items-center gap-2 select-none transition-colors duration-150 ${className}`}
        >
            {isMet ? (
                <Check
                    className="w-3.5 h-3.5 text-[#1aae39] stroke-[2.5] shrink-0"
                    aria-hidden="true"
                />
            ) : (
                <Circle
                    className="w-3.5 h-3.5 text-[#a39e98] stroke-[1.5] shrink-0"
                    aria-hidden="true"
                />
            )}
            <span
                className={`text-[13px] leading-snug transition-colors ${
                    isMet ? "text-[#1aae39] font-medium" : "text-[#615d59] font-normal"
                }`}
            >
                {label}
            </span>
        </li>
    );
};
