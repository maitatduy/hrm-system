import { Button } from "./Button";

export interface SectionErrorStateProps {
    readonly message: string;
    readonly onRetry: () => void;
    readonly isRetrying?: boolean;
}

export const SectionErrorState = ({
    message,
    onRetry,
    isRetrying = false,
}: SectionErrorStateProps) => (
    <div role="alert" className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <p className="text-[14px] text-ink-muted">{message}</p>
        <Button variant="secondary" className="h-10" onClick={onRetry} isLoading={isRetrying}>
            Thử lại
        </Button>
    </div>
);
