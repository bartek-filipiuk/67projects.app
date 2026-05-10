import { makeProgressBar } from "@/lib/ascii";

export function AsciiProgressBar({
  filled,
  total,
  width = 22,
}: {
  filled: number;
  total: number;
  width?: number;
}) {
  const { filled: f, empty: e } = makeProgressBar(filled, total, width);
  return (
    <span style={{ fontFamily: "var(--font-mono-display)", letterSpacing: "0.02em" }}>
      <span style={{ color: "var(--fg)" }}>[</span>
      <span style={{ color: "var(--accent)" }}>{f}</span>
      <span style={{ color: "var(--dim)" }}>{e}</span>
      <span style={{ color: "var(--fg)" }}>]</span>
    </span>
  );
}
