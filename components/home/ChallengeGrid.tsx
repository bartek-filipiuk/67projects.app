import { CmdHeader } from "../primitives/CmdHeader";

export function ChallengeGrid({ doneDays, total = 67 }: { doneDays: number; total?: number }) {
  const remaining = total - doneDays;
  return (
    <section style={{ padding: "56px 0 8px" }}>
      <CmdHeader cmd="cat ./67-days-of-ai-magic.txt" />
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
            gridTemplateColumns: `repeat(${total}, 1fr)`,
            gap: 4,
            marginBottom: 18,
          }}
        >
          {Array.from({ length: total }, (_, i) => {
            const done = i < doneDays;
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
            <span style={{ color: "var(--dim)" }}>DAY</span> {doneDays} / {total}
          </div>
          <div>
            <span style={{ color: "var(--dim)" }}>REMAINING</span> {remaining} days
          </div>
          <div>
            <span style={{ color: "var(--dim)" }}>NEXT_SHIP</span> tomorrow 09:00 UTC
          </div>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 720, margin: 0 }}>
          Every day, one new product. Every day, one silent-coding video. For 67 days. The whole
          thing is a public bet that one solo founder + Claude Code can outship a five-person
          seed-stage team.
        </p>
      </div>
    </section>
  );
}
