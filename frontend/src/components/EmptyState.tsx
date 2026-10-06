export interface EmptyStateProps {
    readonly message: string;
}

export const EmptyState = ({ message }: EmptyStateProps) => (
    <p className="py-10 text-center text-[14px] text-ink-faint">{message}</p>
);
