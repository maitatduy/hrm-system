import type { ReactNode } from "react";
import { CanvasBackground } from "./CanvasBackground";

export interface AuthLayoutProps {
    readonly children: ReactNode;
    readonly className?: string;
}

export const AuthLayout = ({ children, className = "" }: AuthLayoutProps) => {
    return (
        <div className="min-h-screen w-full flex flex-col justify-between relative overflow-hidden bg-[#f6f5f4] selection:bg-[#0075de]/20 selection:text-[#000000]">
            <CanvasBackground />
            <main
                className={`relative z-10 flex-grow flex items-center justify-center p-4 ${className}`}
            >
                {children}
            </main>
        </div>
    );
};
