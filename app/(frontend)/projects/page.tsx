import { getPayload } from "payload";
import config from "@payload-config";
import { CmdHeader } from "@/components/primitives/CmdHeader";
import { ProductFilter } from "@/components/product/ProductFilter";

export const revalidate = 600;

interface ProjectDoc {
  slug: string;
  name: string;
  path: string;
  priceCents: number;
  currency: string;
  description: string;
  tag?: string | null;
  category: string | { name?: string } | number;
}

export default async function ProjectsPage() {
  let docs: ProjectDoc[] = [];
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "projects",
      where: { status: { equals: "published" } },
      sort: "-day",
      limit: 100,
      depth: 1,
    });
    docs = result.docs as unknown as ProjectDoc[];
  } catch {
    /* DB unavailable */
  }

  const products = docs.map((p) => ({
    slug: p.slug,
    name: p.name,
    path: p.path,
    priceCents: p.priceCents,
    currency: p.currency as "USD" | "EUR" | "PLN",
    description: p.description,
    tag: (p.tag as "BESTSELLER" | "HOT" | "NEW" | "" | null) ?? "",
    categoryName:
      typeof p.category === "object" && p.category && "name" in p.category
        ? (p.category.name as string)
        : "",
  }));

  return (
    <main style={{ padding: "0 0 80px" }}>
      <section style={{ padding: "56px 0 8px" }}>
        <CmdHeader cmd="cd /projects && ls -la" />
        <div
          style={{
            fontSize: 12,
            color: "var(--dim)",
            margin: "6px 0 24px",
            paddingLeft: 18,
          }}
        >
          total {products.length} · sorted by ctime
        </div>
        <ProductFilter products={products} />
      </section>
    </main>
  );
}
