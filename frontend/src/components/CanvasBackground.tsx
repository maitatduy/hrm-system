export const CanvasBackground = () => (
    <div
        className="absolute inset-0 z-0 bg-canvas-soft text-ink overflow-hidden pointer-events-none select-none"
        aria-hidden="true"
    >
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
            <defs>
                <pattern
                    id="auth-canvas-pattern"
                    width="32"
                    height="32"
                    patternUnits="userSpaceOnUse"
                >
                    <circle cx="2" cy="2" r="1" fill="currentColor" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#auth-canvas-pattern)" />
        </svg>
    </div>
);
