export interface AppLogoProps {
    readonly className?: string;
    readonly size?: "sm" | "md" | "lg";
}

export const AppLogo = ({ className = "" }: AppLogoProps) => {
    return (
        <div
            className={`w-12 h-12 rounded-[8px] bg-[#0075de]/10 flex items-center justify-center text-[#0075de] transition-transform duration-200 hover:scale-105 select-none ${className}`}
            aria-label="HRM Logo"
        >
            <svg
                className="w-7 h-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
            </svg>
        </div>
    );
};
