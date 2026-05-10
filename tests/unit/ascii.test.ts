import { describe, it, expect } from "vitest";
import { makeProgressBar, repeat } from "@/lib/ascii";

describe("makeProgressBar", () => {
  it("renders correct fills", () => {
    expect(makeProgressBar(14, 67, 22)).toEqual({ filled: "=".repeat(5), empty: "-".repeat(17) });
  });
  it("handles 0", () => {
    expect(makeProgressBar(0, 67, 10)).toEqual({ filled: "", empty: "-".repeat(10) });
  });
  it("clamps overflow", () => {
    expect(makeProgressBar(200, 67, 10)).toEqual({ filled: "=".repeat(10), empty: "" });
  });
  it("handles total=0 safely", () => {
    expect(makeProgressBar(0, 0, 5)).toEqual({ filled: "", empty: "-----" });
  });
});

describe("repeat", () => {
  it("repeats", () => { expect(repeat("─", 4)).toBe("────"); });
  it("zero", () => { expect(repeat("x", 0)).toBe(""); });
});
