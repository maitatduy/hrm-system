import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "../api";
import type { DashboardMetricKey } from "../types";
import { RecentActivitiesContainer } from "./RecentActivitiesContainer";
import { StatsOverviewContainer } from "./StatsOverviewContainer";

vi.mock("../api");

const renderWithQueryClient = (ui: ReactNode) => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe("StatsOverviewContainer", () => {
    beforeEach(() => {
        vi.mocked(api.getDashboardMetricApi).mockReset();
    });

    it("keeps other cards visible when one metric fails and retries only that metric", async () => {
        vi.mocked(api.getDashboardMetricApi).mockImplementation(async (key: DashboardMetricKey) => {
            if (key === "openPositions") throw new Error("down");
            return { key, value: 248, trend: { changePercent: 3.8, comparedTo: "previous_month" } };
        });

        renderWithQueryClient(<StatsOverviewContainer />);

        expect(await screen.findByText("Vị trí đang tuyển")).toBeInTheDocument();
        expect(screen.getAllByText("248")).toHaveLength(3);
        expect(screen.getByRole("alert")).toHaveTextContent("Không tải được dữ liệu");

        vi.mocked(api.getDashboardMetricApi).mockResolvedValue({
            key: "openPositions",
            value: 6,
            trend: null,
        });
        fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));

        expect(await screen.findByText("6")).toBeInTheDocument();
        expect(api.getDashboardMetricApi).toHaveBeenLastCalledWith("openPositions");
    });
});

describe("RecentActivitiesContainer", () => {
    it("shows the empty state when there is no activity", async () => {
        vi.mocked(api.getRecentActivitiesApi).mockResolvedValue([]);

        renderWithQueryClient(<RecentActivitiesContainer />);

        expect(await screen.findByText("Chưa có hoạt động nào")).toBeInTheDocument();
    });

    it("renders employee name, action and department", async () => {
        vi.mocked(api.getRecentActivitiesApi).mockResolvedValue([
            {
                id: "a1",
                employeeId: "e1",
                employeeName: "Nguyễn Văn An",
                departmentName: "Kỹ thuật",
                action: "CHECKED_IN",
                occurredAt: new Date().toISOString(),
            },
        ]);

        renderWithQueryClient(<RecentActivitiesContainer />);

        expect(await screen.findByText("Nguyễn Văn An")).toBeInTheDocument();
        expect(screen.getByText(/đã chấm công/)).toBeInTheDocument();
        expect(screen.getByText("Kỹ thuật")).toBeInTheDocument();
        expect(screen.getByText("NA")).toBeInTheDocument();
    });
});
