import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getDepartmentDistributionApi } from "../api";
import type { DepartmentShare } from "../types";
import { DASHBOARD_QUERY_KEYS } from "./queryKeys";

export const useDepartmentDistributionQuery = (): UseQueryResult<DepartmentShare[], Error> =>
    useQuery({
        queryKey: DASHBOARD_QUERY_KEYS.departmentDistribution,
        queryFn: getDepartmentDistributionApi,
        staleTime: 30 * 60 * 1000,
    });
