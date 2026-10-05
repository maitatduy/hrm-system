import { useQuery } from "@tanstack/react-query";
import { getCurrentUserApi } from "../api";
import { useAuthStore } from "../store";

/** Nạp lại thông tin người dùng sau khi F5, khi store chỉ còn access token trong localStorage. */
export const useCurrentUserQuery = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return useQuery({
        queryKey: ["auth", "me"],
        queryFn: getCurrentUserApi,
        enabled: isAuthenticated,
        retry: false,
    });
};
