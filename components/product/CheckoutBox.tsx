import { repeat } from "@/lib/ascii";
import { formatPrice } from "./ProductCard";
import { TheMath } from "./TheMath";

interface Props {
  path: string;
  priceCents: number;
  currency: string;
  buyersCount: number;
  avgRating: number;
}

export function CheckoutBox({ path, priceCents, currency, buyersCount, avgRating }: Props) {
  return (
    <div
      style={{
        position: "sticky",
        top: 16,
        border: "2px solid var(--border)",
        padding: 18,
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ fontSize: 12, color: "var(--dim)" }}>{path}</div>
      <div style={dividerStyle}>{repeat("=", 40)}</div>
      <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, marginTop: 4 }}>
        {formatPrice(priceCents, currency)}
      </div>
      <div style={{ fontSize: 12, color: "var(--dim)", marginBottom: 8 }}>
        one-time · lifetime updates
      </div>
      <button type="button" disabled className="btn-brutal btn-primary btn-block">
        &gt; BUY NOW
      </button>
      <button type="button" disabled className="btn-brutal btn-ghost btn-block">
        &gt; PREVIEW REPO
      </button>
      <div style={dividerStyle}>{repeat("-", 40)}</div>
      <TheMath priceCents={priceCents} currency={currency} />
      <div style={dividerStyle}>{repeat("-", 40)}</div>
      <div style={{ fontSize: 11, color: "var(--dim)", display: "flex", flexDirection: "column", gap: 3 }}>
        <div># {buyersCount} buyers · {avgRating.toFixed(1)} ★ avg</div>
        <div># refund window: 14 days</div>
        <div># lifetime updates included</div>
      </div>
    </div>
  );
}

const dividerStyle: React.CSSProperties = {
  fontSize: 11,
  color: "var(--dim)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  lineHeight: 1,
};
