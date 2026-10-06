import { useQuery } from "@tanstack/react-query";
import { getCurrentUserApi } from "../api";
import { useAuthStore } from "../store";

export const CURRENT_USER_QUERY_KEY = ["auth", "me"] as const;

/** Nạp lại thông tin người dùng sau khi F5, khi store chỉ còn access token đã lưu. */
export const useCurrentUserQuery = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return useQuery({
        queryKey: CURRENT_USER_QUERY_KEY,
        queryFn: async () => {
            const user = await getCurrentUserApi();
            // Đồng bộ vào store ngay khi có dữ liệu để các component đọc store không bị trễ một lượt render
            useAuthStore.getState().setSessionUser(user);
            return user;
        },
        enabled: isAuthenticated,
        retry: false,
    });
};
