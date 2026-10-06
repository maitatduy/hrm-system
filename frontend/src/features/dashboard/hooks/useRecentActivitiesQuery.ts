import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getRecentActivitiesApi } from "../api";
import type { RecentActivity } from "../types";
import { DASHBOARD_QUERY_KEYS } from "./queryKeys";

export const useRecentActivitiesQuery = (limit: number): UseQueryResult<RecentActivity[], Error> =>
    useQuery({
        queryKey: DASHBOARD_QUERY_KEYS.activities(limit),
        queryFn: () => getRecentActivitiesApi(limit),
        // Tự làm mới mỗi phút, TanStack Query mặc định dừng khi tab bị ẩn
        refetchInterval: 60 * 1000,
        staleTime: 60 * 1000,
    });
