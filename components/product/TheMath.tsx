import { repeat } from "@/lib/ascii";
import { formatPrice } from "./ProductCard";

export function TheMath({
  priceCents,
  currency,
  hourlyRate = 50,
  hoursSaved = 40,
}: {
  priceCents: number;
  currency: string;
  hourlyRate?: number;
  hoursSaved?: number;
}) {
  const valueCents = hoursSaved * hourlyRate * 100;
  const roi = priceCents > 0 ? Math.round(((valueCents - priceCents) / priceCents) * 100) : 0;
  return (
    <div style={{ fontSize: 13 }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: "var(--dim)", fontSize: 12 }}>
        # the-math.txt
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>time saved</span>
        <span>{hoursSaved}h</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>your rate</span>
        <span>${hourlyRate}/h</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>value</span>
        <span>{formatPrice(valueCents, currency)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>price</span>
        <span>{formatPrice(priceCents, currency)}</span>
      </div>
      <div style={{ color: "var(--dim)", fontSize: 11, padding: "4px 0" }}>{repeat("-", 36)}</div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontWeight: 800,
          color: "var(--accent)",
          fontSize: 16,
        }}
      >
        <span>ROI</span>
        <span>{roi}%</span>
      </div>
    </div>
  );
}
