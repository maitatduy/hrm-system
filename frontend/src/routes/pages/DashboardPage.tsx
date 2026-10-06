export interface DashboardPageProps {
    readonly title: string;
}

/** Trang tổng quan tạm thời cho từng nhóm vai trò, sẽ thay bằng dashboard thật của từng module. */
export const DashboardPage = ({ title }: DashboardPageProps) => (
    <section className="bg-surface rounded-lg border border-hairline p-6 shadow-xs max-w-4xl">
        <title>{`${title} - HRM System`}</title>
        <h1 className="text-xl font-bold text-ink">{title}</h1>
        <p className="text-[14px] text-ink-muted mt-2">
            Chào mừng bạn trở lại không gian làm việc HRM System.
        </p>
    </section>
);
