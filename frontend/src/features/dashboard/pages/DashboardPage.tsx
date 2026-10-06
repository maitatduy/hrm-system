import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DASHBOARD_MESSAGES } from "@/constants/messages";
import { formatDate } from "@/lib/date";
import { AttendanceTrendContainer } from "../components/AttendanceTrendContainer";
import { DepartmentDistributionContainer } from "../components/DepartmentDistributionContainer";
import { RecentActivitiesContainer } from "../components/RecentActivitiesContainer";
import { StatsOverviewContainer } from "../components/StatsOverviewContainer";
import { UpcomingEventsContainer } from "../components/UpcomingEventsContainer";

/** Trang tổng quan cho ADMIN và HR. Mỗi khối tự gọi dữ liệu nên khối lỗi không ảnh hưởng khối khác. */
export const DashboardPage = () => {
    // Chốt ngày lúc mở trang, tránh tạo Date mới ở mỗi lần render
    const [todayLabel] = useState(() => formatDate(new Date()));

    return (
        <div className="w-full max-w-7xl flex flex-col gap-6">
            <title>{`${DASHBOARD_MESSAGES.PAGE_TITLE} - HRM System`}</title>
            <PageHeader title={DASHBOARD_MESSAGES.PAGE_TITLE} description={todayLabel} />

            <StatsOverviewContainer />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AttendanceTrendContainer />
                <DepartmentDistributionContainer />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <RecentActivitiesContainer className="lg:col-span-2" />
                <UpcomingEventsContainer />
            </div>
        </div>
    );
};
