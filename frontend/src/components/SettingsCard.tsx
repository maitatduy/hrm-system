import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface SettingsCardProps {
    readonly title: string;
    readonly description?: string;
    readonly className?: string;
    readonly children: ReactNode;
}

export const SettingsCard = ({ title, description, className, children }: SettingsCardProps) => (
    <section
        className={cn(
            "w-full bg-surface border border-hairline rounded-lg p-6 md:p-8 shadow-xs",
            className,
        )}
    >
        <div className="pb-4 mb-6 border-b border-hairline">
            <h2 className="text-[20px] font-bold text-ink tracking-tight">{title}</h2>
            {description && (
                <p className="text-[14px] text-ink-muted mt-1 leading-relaxed">{description}</p>
            )}
        </div>
        {children}
    </section>
);
