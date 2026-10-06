import { useCallback, useEffect, useRef } from "react";
import { useNavigate, type NavigateOptions } from "react-router-dom";

/**
 * Điều hướng sau một khoảng trễ để người dùng kịp đọc thông báo thành công.
 * Hẹn giờ tự hủy khi component unmount, tránh điều hướng ngoài ý muốn.
 */
export const useDelayedNavigate = (delayMs: number) => {
    const navigate = useNavigate();
    const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => () => clearTimeout(timerRef.current), []);

    return useCallback(
        (to: string, options?: NavigateOptions) => {
            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => navigate(to, options), delayMs);
        },
        [delayMs, navigate],
    );
};
