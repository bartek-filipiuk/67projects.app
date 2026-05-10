import { Cursor } from "./Cursor";

export function CmdHeader({ cmd, blink = true }: { cmd: string; blink?: boolean }) {
  return (
    <h2
      style={{
        fontSize: 22,
        fontWeight: 700,
        margin: 0,
        letterSpacing: "-0.01em",
        display: "flex",
        alignItems: "baseline",
        flexWrap: "wrap",
      }}
    >
      <span style={{ color: "var(--accent)", marginRight: 6 }}>&gt; </span>
      <span>{cmd}</span>
      <Cursor blink={blink} char="_" />
    </h2>
  );
}
