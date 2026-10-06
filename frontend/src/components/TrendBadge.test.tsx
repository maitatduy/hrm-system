import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TrendBadge } from "./TrendBadge";

describe("TrendBadge", () => {
    it("shows an increase of a good metric in green", () => {
        render(<TrendBadge changePercent={3.8} />);
        expect(screen.getByText("3,8%")).toHaveClass("text-accent-green");
        expect(screen.getByText("so với tháng trước")).toBeInTheDocument();
    });

    it("shows an increase of a bad metric in red", () => {
        render(<TrendBadge changePercent={12.5} isPositiveGood={false} />);
        expect(screen.getByText("12,5%")).toHaveClass("text-accent-danger");
    });

    it("shows a decrease of a bad metric in green without the minus sign", () => {
        render(<TrendBadge changePercent={-14.3} isPositiveGood={false} />);
        expect(screen.getByText("14,3%")).toHaveClass("text-accent-green");
    });

    it("shows no change in muted color", () => {
        render(<TrendBadge changePercent={0} />);
        expect(screen.getByText("0%")).toHaveClass("text-ink-muted");
    });
});
