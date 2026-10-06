import { useCallback, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";

const createEmptyDigits = (length: number) => Array.from({ length }, () => "");

/** Quản lý nhập OTP theo từng ô: tự chuyển ô, xóa lùi, phím mũi tên và dán cả mã. */
export const useOtpInput = (length = 6) => {
    const [digits, setDigits] = useState<string[]>(() => createEmptyDigits(length));
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const focusSlot = useCallback(
        (index: number) => {
            const target = Math.max(0, Math.min(index, length - 1));
            inputRefs.current[target]?.focus();
            setActiveIndex(target);
        },
        [length],
    );

    const registerInputRef = useCallback((index: number, element: HTMLInputElement | null) => {
        inputRefs.current[index] = element;
    }, []);

    const setDigitAt = (index: number, digit: string) =>
        setDigits((prev) => prev.map((value, i) => (i === index ? digit : value)));

    const handleDigitChange = (index: number, rawValue: string) => {
        const digit = rawValue.slice(-1);
        if (digit && !/^\d$/.test(digit)) return;

        setDigitAt(index, digit);
        if (digit) focusSlot(index + 1);
    };

    const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Backspace") {
            event.preventDefault();
            if (digits[index]) {
                setDigitAt(index, "");
            } else if (index > 0) {
                setDigitAt(index - 1, "");
                focusSlot(index - 1);
            }
        } else if (event.key === "ArrowLeft") {
            focusSlot(index - 1);
        } else if (event.key === "ArrowRight") {
            focusSlot(index + 1);
        }
    };

    const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
        event.preventDefault();
        const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
        if (!pasted) return;

        setDigits(createEmptyDigits(length).map((_, i) => pasted[i] ?? ""));
        focusSlot(pasted.length);
    };

    const reset = useCallback(() => {
        setDigits(createEmptyDigits(length));
        focusSlot(0);
    }, [focusSlot, length]);

    const code = digits.join("");

    return {
        digits,
        code,
        isComplete: code.length === length,
        activeIndex,
        registerInputRef,
        focusSlot,
        handleDigitChange,
        handleKeyDown,
        handlePaste,
        handleFocus: setActiveIndex,
        reset,
    };
};
