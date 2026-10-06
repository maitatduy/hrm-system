import type { ReactNode } from "react";

export interface AuthHeaderProps {
    readonly title: string;
    readonly description?: ReactNode;
}

export const AuthHeader = ({ title, description }: AuthHeaderProps) => (
    <div className="flex flex-col items-center text-center gap-3">
        <h1 className="text-[26px] md:text-[28px] leading-tight font-bold text-ink tracking-tight">
            {title}
        </h1>
        {description && <p className="text-[16px] text-ink-muted leading-relaxed">{description}</p>}
    </div>
);
