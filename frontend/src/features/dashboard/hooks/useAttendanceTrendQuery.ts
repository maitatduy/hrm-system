import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getAttendanceTrendApi } from "../api";
import type { AttendanceRatePoint } from "../types";
import { DASHBOARD_QUERY_KEYS } from "./queryKeys";

export const useAttendanceTrendQuery = (
    months: number,
): UseQueryResult<AttendanceRatePoint[], Error> =>
    useQuery({
        queryKey: DASHBOARD_QUERY_KEYS.attendanceTrend(months),
        queryFn: () => getAttendanceTrendApi(months),
        // Dữ liệu theo tháng ít thay đổi
        staleTime: 30 * 60 * 1000,
    });
