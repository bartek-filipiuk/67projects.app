import { repeat } from "@/lib/ascii";

export function AsciiHr({ char = "─" }: { char?: string }) {
  return (
    <div
      aria-hidden
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        color: "var(--dim)",
        fontSize: 12,
        lineHeight: 1,
        padding: "6px 0",
      }}
    >
      {repeat(char, 200)}
    </div>
  );
}
