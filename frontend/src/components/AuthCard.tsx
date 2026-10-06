import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface AuthCardProps {
    readonly className?: string;
    readonly children: ReactNode;
}

export const AuthCard = ({ className, children }: AuthCardProps) => (
    <div
        className={cn(
            "relative z-10 w-full max-w-[480px] bg-surface border border-hairline rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-7 md:p-9 flex flex-col gap-6",
            className,
        )}
    >
        {children}
    </div>
);
