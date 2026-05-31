import { CmdHeader } from "../primitives/CmdHeader";

interface ChallengeGridProps {
  shipped: number;
  total?: number;
  cmd: string;
  copy: string;
  nextShipText: string;
}

export function ChallengeGrid({
  shipped,
  total = 67,
  cmd,
  copy,
  nextShipText,
}: ChallengeGridProps) {
  const remaining = total - shipped;
  return (
    <section style={{ padding: "56px 0 8px" }}>
      <CmdHeader cmd={cmd} />
      <div
        style={{
          border: "2px solid var(--border)",
          padding: 24,
          background: "var(--bg-soft)",
          marginTop: 8,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))`,
            gap: 4,
            marginBottom: 18,
          }}
        >
          {Array.from({ length: total }, (_, i) => {
            const done = i < shipped;
            return (
              <div
                key={i}
                style={{
                  aspectRatio: "1/1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid var(--border)",
                  fontSize: 12,
                  color: done ? "#fff" : "var(--dim)",
                  background: done ? "var(--accent)" : "transparent",
                  minWidth: 0,
                }}
              >
                {done ? "■" : "·"}
              </div>
            );
          })}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            borderTop: "1px dashed var(--border)",
            borderBottom: "1px dashed var(--border)",
            padding: "12px 0",
            fontSize: 13,
            marginBottom: 14,
          }}
        >
          <div>
            <span style={{ color: "var(--dim)" }}>SHIPPED</span> {shipped} / {total}
          </div>
          <div>
            <span style={{ color: "var(--dim)" }}>REMAINING</span> {remaining} projects
          </div>
          <div>
            <span style={{ color: "var(--dim)" }}>NEXT_SHIP</span> {nextShipText}
          </div>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 720, margin: 0 }}>{copy}</p>
      </div>
    </section>
  );
}
