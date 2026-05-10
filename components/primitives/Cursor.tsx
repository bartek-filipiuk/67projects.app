"use client";

export function Cursor({ blink = true, char = "█" }: { blink?: boolean; char?: string }) {
  return (
    <span className={blink ? "cursor-blink" : ""} aria-hidden style={{ marginLeft: 2 }}>
      {char}
    </span>
  );
}
