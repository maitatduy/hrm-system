import { cn } from "@/lib/cn";

export interface SkeletonProps {
    readonly className?: string;
}

/** Truyền kích thước qua className, giữ đúng kích thước khối thật để trang không nhảy khi dữ liệu về. */
export const Skeleton = ({ className }: SkeletonProps) => (
    <div aria-hidden="true" className={cn("bg-canvas-soft rounded-md animate-pulse", className)} />
);
