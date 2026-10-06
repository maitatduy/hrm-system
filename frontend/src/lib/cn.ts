import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Ghép className có điều kiện và để class truyền vào sau ghi đè class mặc định khi trùng thuộc tính. */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
