import type { ReactNode } from "react";
import { AUTH_MESSAGES } from "@/constants/messages";

/** Khung toàn màn hình cho thông báo trạng thái phiên đăng nhập. */
export const FullScreenMessage = ({ children }: { readonly children: ReactNode }) => (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-canvas-soft text-[14px] text-ink-muted">
        {children}
    </div>
);

/** Hiển thị trong lúc đang khôi phục phiên bằng cookie refresh, chưa biết người dùng đã đăng nhập hay chưa. */
export const SessionRestoring = () => (
    <FullScreenMessage>
        <p role="status">{AUTH_MESSAGES.SESSION_LOADING}</p>
    </FullScreenMessage>
);
