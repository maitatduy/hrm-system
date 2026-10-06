import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface SectionCardProps {
    readonly title: string;
    readonly action?: ReactNode;
    readonly className?: string;
    readonly children: ReactNode;
}

export const SectionCard = ({ title, action, className, children }: SectionCardProps) => (
    <section
        className={cn(
            "min-w-0 bg-surface border border-hairline rounded-lg p-6 shadow-xs",
            className,
        )}
    >
        <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-[16px] font-bold text-ink">{title}</h2>
            {action}
        </div>
        {children}
    </section>
);
