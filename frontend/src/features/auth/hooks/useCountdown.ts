import { useCallback, useEffect, useState } from "react";

/** Đếm ngược theo giây, dùng cho thời gian chờ gửi lại OTP. */
export const useCountdown = (initialSeconds: number) => {
    const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

    useEffect(() => {
        if (secondsLeft <= 0) return;
        const timer = setTimeout(() => setSecondsLeft((prev) => prev - 1), 1000);
        return () => clearTimeout(timer);
    }, [secondsLeft]);

    const restart = useCallback(() => setSecondsLeft(initialSeconds), [initialSeconds]);

    return { secondsLeft, isRunning: secondsLeft > 0, restart };
};
