import { useQueries } from "@tanstack/react-query";
import { getDashboardMetricApi } from "../api";
import type { DashboardMetric, DashboardMetricKey } from "../types";
import { DASHBOARD_QUERY_KEYS } from "./queryKeys";

export const DASHBOARD_METRIC_KEYS: readonly DashboardMetricKey[] = [
    "totalEmployees",
    "presentToday",
    "onLeaveToday",
    "openPositions",
];

export interface DashboardSummaryResult {
    /** Cùng thứ tự với DASHBOARD_METRIC_KEYS, undefined khi chỉ số đó chưa có dữ liệu. */
    readonly metrics: readonly (DashboardMetric | undefined)[];
    readonly isLoading: boolean;
    readonly failedKeys: readonly DashboardMetricKey[];
    readonly refetch: () => void;
}

/** Gọi song song bốn endpoint thống kê, mỗi chỉ số có trạng thái riêng để thẻ lỗi không kéo theo thẻ khác. */
export const useDashboardSummaryQuery = (): DashboardSummaryResult =>
    useQueries({
        queries: DASHBOARD_METRIC_KEYS.map((key) => ({
            queryKey: DASHBOARD_QUERY_KEYS.summary(key),
            queryFn: () => getDashboardMetricApi(key),
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: true,
        })),
        combine: (results) => {
            const failedIndexes = results.flatMap((result, index) =>
                result.isError ? [index] : [],
            );

            return {
                metrics: results.map((result) => result.data),
                isLoading: results.some((result) => result.isPending && !result.isError),
                failedKeys: failedIndexes.map((index) => DASHBOARD_METRIC_KEYS[index]),
                refetch: () => {
                    failedIndexes.forEach((index) => void results[index].refetch());
                },
            };
        },
    });
