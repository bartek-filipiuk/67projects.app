import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { CmdHeader } from "@/components/primitives/CmdHeader";
import { CheckoutBox } from "@/components/product/CheckoutBox";
import { repeat } from "@/lib/ascii";
import { slugSchema } from "@/lib/validators";

interface Args { params: Promise<{ slug: string }>; }

export async function generateStaticParams() {
  const payload = await getPayload({ config });
  const r = await payload.find({
    collection: "projects",
    where: { status: { equals: "published" } },
    limit: 100,
  });
  return r.docs.map((p) => ({ slug: p.slug }));
}

export const revalidate = 600;

export default async function ProjectDetail({ params }: Args) {
  const { slug } = await params;
  if (!slugSchema.safeParse(slug).success) notFound();
  const payload = await getPayload({ config });
  const r = await payload.find({
    collection: "projects",
    where: { slug: { equals: slug }, status: { equals: "published" } },
    limit: 1,
  });
  const p = r.docs[0];
  if (!p) notFound();

  return (
    <main style={{ padding: "0 0 80px" }}>
      <section style={{ padding: "56px 0 8px" }}>
        <CmdHeader cmd={`cat /projects/${p.slug}.md`} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) 360px",
            gap: 32,
            marginTop: 12,
          }}
          className="detail-grid"
        >
          <div>
            <div style={{ fontSize: 13, color: "var(--dim)" }}>{p.path}</div>
            <div
              style={{
                fontSize: 11,
                color: "var(--dim)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                lineHeight: 1,
                margin: "4px 0 16px",
              }}
            >
              {repeat("=", 80)}
            </div>
            <h1
              style={{
                fontSize: "clamp(36px, 5vw, 56px)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.02,
                margin: "0 0 16px",
              }}
            >
              {p.name}
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.65, maxWidth: 720 }}>{p.description}</p>
            {p.features && p.features.length > 0 && (
              <>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: "32px 0 10px" }}># features</h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 14, lineHeight: 1.7 }}>
                  {p.features.map((f, i) => (
                    <li key={i}>
                      <span style={{ color: "var(--accent)", marginRight: 10, fontWeight: 800 }}>*</span>
                      {f.text}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {p.tree && (
              <>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: "32px 0 10px" }}>
                  # whats-included
                </h3>
                <div
                  style={{
                    border: "2px solid var(--border)",
                    background: "var(--bg-soft)",
                    padding: "14px 18px",
                    fontSize: 13,
                  }}
                >
                  <pre
                    style={{
                      margin: 0,
                      fontFamily: "var(--font-mono)",
                      whiteSpace: "pre",
                      overflowX: "auto",
                    }}
                  >
                    {p.tree}
                  </pre>
                </div>
              </>
            )}
          </div>
          <aside>
            <CheckoutBox
              path={p.path}
              priceCents={p.priceCents}
              currency={p.currency}
              buyersCount={p.buyersCount ?? 0}
              avgRating={p.avgRating ?? 0}
            />
          </aside>
        </div>
      </section>
    </main>
  );
}
