"use client";
import { useState, useMemo } from "react";
import { ProductCard, type ProductCardData } from "./ProductCard";

interface Props { products: (ProductCardData & { categoryName: string })[]; }

const PILLS = ["ALL", "BOILERPLATES", "DEV TOOLS", "CREATOR ECONOMY"] as const;
type Pill = (typeof PILLS)[number];

export function ProductFilter({ products }: Props) {
  const [cat, setCat] = useState<Pill>("ALL");
  const filtered = useMemo(
    () => (cat === "ALL" ? products : products.filter((p) => p.categoryName.toUpperCase() === cat)),
    [cat, products],
  );

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
          borderTop: "2px solid var(--border)",
          borderBottom: "2px solid var(--border)",
          padding: "12px 0",
          marginBottom: 24,
        }}
      >
        {PILLS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={`btn-pill${cat === c ? " active" : ""}`}
          >
            [{c}]
          </button>
        ))}
      </div>
      <div className="grid-3">
        {filtered.map((p) => (
          <ProductCard key={p.slug} p={p} />
        ))}
      </div>
    </>
  );
}
