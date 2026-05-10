export function makeProgressBar(filled: number, total: number, width = 24): { filled: string; empty: string } {
  if (total <= 0 || width <= 0) {
    return { filled: "", empty: "-".repeat(Math.max(0, width)) };
  }
  const ratio = Math.max(0, Math.min(1, filled / total));
  const filledChars = Math.round(ratio * width);
  return { filled: "=".repeat(filledChars), empty: "-".repeat(width - filledChars) };
}

export function repeat(char: string, n: number): string {
  return n <= 0 ? "" : char.repeat(n);
}

export const ASCII_LINE_80 = repeat("─", 80);
export const DASHED_40 = repeat("-", 40);
export const DOUBLE_40 = repeat("=", 40);
