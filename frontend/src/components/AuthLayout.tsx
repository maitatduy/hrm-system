import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { CanvasBackground } from "./CanvasBackground";

export interface AuthLayoutProps {
    readonly className?: string;
    readonly children: ReactNode;
}

export const AuthLayout = ({ className, children }: AuthLayoutProps) => (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden bg-canvas-soft selection:bg-primary/20 selection:text-ink">
        <CanvasBackground />
        <main className={cn("relative z-10 grow flex items-center justify-center p-4", className)}>
            {children}
        </main>
    </div>
);
