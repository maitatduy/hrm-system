export interface PageHeaderProps {
    readonly title: string;
    readonly description?: string;
}

/** Tiêu đề đầu trang dùng chung cho các trang module. */
export const PageHeader = ({ title, description }: PageHeaderProps) => (
    <header>
        <h1 className="text-xl font-bold text-ink">{title}</h1>
        {description && <p className="text-[14px] text-ink-muted mt-1">{description}</p>}
    </header>
);
