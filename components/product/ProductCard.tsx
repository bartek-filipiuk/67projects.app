import Link from "next/link";
import { repeat } from "@/lib/ascii";

export interface ProductCardData {
  slug: string;
  name: string;
  path: string;
  priceCents: number;
  currency: "USD" | "EUR" | "PLN";
  description: string;
  tag?: "BESTSELLER" | "HOT" | "NEW" | "";
}

const SYM: Record<string, string> = { USD: "$", EUR: "€", PLN: "zł" };

export function formatPrice(cents: number, currency: string): string {
  const sym = SYM[currency] ?? "";
  return `${sym}${(cents / 100).toFixed(2)}`;
}

export function ProductCard({ p }: { p: ProductCardData }) {
  return (
    <Link href={`/projects/${p.slug}`} className="file-card">
      <div className="file-card-path">{p.path}</div>
      <div className="file-card-divider">{repeat("-", 80)}</div>
      <div className="file-card-body">
        <div className="file-card-title">{p.name}</div>
        <div className="file-card-desc">{p.description}</div>
      </div>
      <div className="file-card-footer">
        <div className="file-card-price">{formatPrice(p.priceCents, p.currency)}</div>
        {p.tag && <div className={`file-tag tag-${p.tag.toLowerCase()}`}>[{p.tag}]</div>}
      </div>
    </Link>
  );
}
