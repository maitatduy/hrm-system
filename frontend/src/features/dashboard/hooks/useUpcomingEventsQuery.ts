import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getUpcomingEventsApi } from "../api";
import type { UpcomingEvent } from "../types";
import { DASHBOARD_QUERY_KEYS } from "./queryKeys";

export const useUpcomingEventsQuery = (limit: number): UseQueryResult<UpcomingEvent[], Error> =>
    useQuery({
        queryKey: DASHBOARD_QUERY_KEYS.upcomingEvents(limit),
        queryFn: () => getUpcomingEventsApi(limit),
        staleTime: 10 * 60 * 1000,
    });
