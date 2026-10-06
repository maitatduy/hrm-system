import type { ClipboardEvent, KeyboardEvent } from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useOtpInput } from "./useOtpInput";

const keyEvent = (key: string) =>
    ({ key, preventDefault: vi.fn() }) as unknown as KeyboardEvent<HTMLInputElement>;

const pasteEvent = (text: string) =>
    ({
        preventDefault: vi.fn(),
        clipboardData: { getData: () => text },
    }) as unknown as ClipboardEvent<HTMLInputElement>;

describe("useOtpInput", () => {
    it("accepts digits, ignores other characters and moves to the next slot", () => {
        const { result } = renderHook(() => useOtpInput(6));

        act(() => result.current.handleDigitChange(0, "7"));
        act(() => result.current.handleDigitChange(1, "x"));

        expect(result.current.digits).toEqual(["7", "", "", "", "", ""]);
        expect(result.current.activeIndex).toBe(1);
    });

    it("fills all slots from pasted text and strips non-digits", () => {
        const { result } = renderHook(() => useOtpInput(6));

        act(() => result.current.handlePaste(pasteEvent("12-34 56")));

        expect(result.current.code).toBe("123456");
        expect(result.current.isComplete).toBe(true);
    });

    it("clears the previous slot on backspace from an empty slot", () => {
        const { result } = renderHook(() => useOtpInput(6));

        act(() => result.current.handlePaste(pasteEvent("12")));
        act(() => result.current.handleKeyDown(2, keyEvent("Backspace")));

        expect(result.current.digits).toEqual(["1", "", "", "", "", ""]);
        expect(result.current.activeIndex).toBe(1);
    });

    it("resets all digits", () => {
        const { result } = renderHook(() => useOtpInput(6));

        act(() => result.current.handlePaste(pasteEvent("123456")));
        act(() => result.current.reset());

        expect(result.current.code).toBe("");
        expect(result.current.activeIndex).toBe(0);
    });
});
