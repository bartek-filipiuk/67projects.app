import Link from "next/link";
import { Cursor } from "../primitives/Cursor";
import { AsciiProgressBar } from "../primitives/AsciiProgressBar";

interface HeroProps {
  title: string;
  subtitle: string;
  shipped: number;
  total: number;
  totalRevenueCents: number;
  statusLabel: string;
  mrrLabel: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
}

export function Hero({
  title,
  subtitle,
  shipped,
  total,
  totalRevenueCents,
  statusLabel,
  mrrLabel,
  primaryCta,
  secondaryCta,
}: HeroProps) {
  const titleLines = title.split("\n");
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
        {titleLines.map((line, i) => (
          <span key={i} style={{ display: "block" }}>
            {line}
            {i === titleLines.length - 1 && <Cursor char="█" />}
          </span>
        ))}
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
        <AsciiProgressBar filled={shipped} total={total} width={22} />
        <span style={{ fontWeight: 500 }}>
          {shipped}/{total} shipped
        </span>
      </div>
      <p
        style={{
          fontSize: 16,
          lineHeight: 1.65,
          maxWidth: 640,
          margin: "0 0 24px",
          whiteSpace: "pre-line",
        }}
      >
        {subtitle}
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
          <span style={{ color: "var(--dim)" }}># status:</span> {statusLabel}
        </div>
        <div>
          <span style={{ color: "var(--dim)" }}># shipped:</span> {shipped}/{total}
        </div>
        <div>
          <span style={{ color: "var(--dim)" }}># mrr:</span> {mrrLabel}
        </div>
        <div>
          <span style={{ color: "var(--dim)" }}># total-revenue:</span> $
          {(totalRevenueCents / 100).toFixed(2)}
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href={primaryCta.href} className="btn-brutal btn-primary">
          {primaryCta.label}
        </Link>
        <Link href={secondaryCta.href} className="btn-brutal btn-ghost">
          {secondaryCta.label}
        </Link>
      </div>
    </section>
  );
}
