export interface DashboardPageProps {
    readonly title: string;
}

/** Trang tổng quan tạm thời cho từng nhóm vai trò, sẽ thay bằng dashboard thật của từng module. */
export const DashboardPage = ({ title }: DashboardPageProps) => (
    <>
        <title>{`${title} - HRM System`}</title>
        <h1 className="text-xl font-bold text-ink">{title}</h1>
    </>
);
