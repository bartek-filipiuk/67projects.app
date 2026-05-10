import Link from "next/link";
import { Cursor } from "../primitives/Cursor";
import { AsciiProgressBar } from "../primitives/AsciiProgressBar";

interface HeroProps {
  currentDay: number;
  total: number;
  totalRevenueCents: number;
  streak: number;
}

export function Hero({ currentDay, total, totalRevenueCents, streak }: HeroProps) {
  return (
    <section style={{ padding: "56px 0 36px", borderBottom: "2px solid var(--border)" }}>
      <h1
        style={{
          fontFamily: "var(--font-mono-display)",
          fontSize: "clamp(48px, 8vw, 112px)",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          lineHeight: 0.95,
          margin: "0 0 20px",
        }}
      >
        67 Projects.
        <br />
        Built with AI.
        <Cursor char="█" />
      </h1>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 14,
          fontSize: "clamp(18px,2.4vw,28px)",
          margin: "0 0 18px",
          fontWeight: 600,
        }}
      >
        <AsciiProgressBar filled={currentDay} total={total} width={22} />
        <span style={{ fontWeight: 500 }}>
          {currentDay}/{total} shipped
        </span>
      </div>
      <p style={{ fontSize: 16, lineHeight: 1.65, maxWidth: 640, margin: "0 0 24px" }}>
        One solo founder. Zero lines of code typed.
        <br />
        67 micro-products for developers and creators. One at a time. No subscriptions.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0,1fr))",
          gap: "12px 24px",
          fontSize: 12,
          borderTop: "1px dashed var(--border)",
          borderBottom: "1px dashed var(--border)",
          padding: "12px 0",
          margin: "0 0 28px",
        }}
      >
        <div>
          <span style={{ color: "var(--dim)" }}># status:</span> shipping daily
        </div>
        <div>
          <span style={{ color: "var(--dim)" }}># streak:</span> {streak} days
        </div>
        <div>
          <span style={{ color: "var(--dim)" }}># mrr:</span> $0 (one-time only)
        </div>
        <div>
          <span style={{ color: "var(--dim)" }}># total-revenue:</span> $
          {(totalRevenueCents / 100).toFixed(2)}
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/projects" className="btn-brutal btn-primary">
          &gt; BROWSE ALL PROJECTS
        </Link>
        <Link href="/log" className="btn-brutal btn-ghost">
          &gt; READ THE LOG
        </Link>
      </div>
    </section>
  );
}
