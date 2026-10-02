import type { SettingsCardProps } from "@/features/auth/types";

export const SettingsCard = ({
    title,
    description,
    children,
    className = "",
}: SettingsCardProps) => {
    return (
        <section
            className={`w-full bg-[#ffffff] border border-[#e6e6e6] rounded-lg p-6 md:p-8 shadow-xs ${className}`}
        >
            <div className="pb-4 mb-6 border-b border-[#e6e6e6]">
                <h2 className="text-[20px] font-bold text-[#000000] tracking-tight">{title}</h2>
                {description && (
                    <p className="text-[14px] text-[#615d59] mt-1 leading-relaxed">
                        {description}
                    </p>
                )}
            </div>
            {children}
        </section>
    );
};
