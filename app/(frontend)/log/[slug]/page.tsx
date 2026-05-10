import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { CmdHeader } from "@/components/primitives/CmdHeader";
import { slugSchema } from "@/lib/validators";

interface Args { params: Promise<{ slug: string }>; }

export async function generateStaticParams() {
  const payload = await getPayload({ config });
  const r = await payload.find({
    collection: "logEntries",
    where: { published: { equals: true } },
    limit: 200,
  });
  return r.docs.map((e) => ({ slug: e.slug }));
}

export const revalidate = 600;

export default async function LogEntryPage({ params }: Args) {
  const { slug } = await params;
  if (!slugSchema.safeParse(slug).success) notFound();
  const payload = await getPayload({ config });
  const r = await payload.find({
    collection: "logEntries",
    where: { slug: { equals: slug }, published: { equals: true } },
    limit: 1,
  });
  const e = r.docs[0];
  if (!e) notFound();

  return (
    <main style={{ padding: "0 0 80px" }}>
      <section style={{ padding: "56px 0 8px" }}>
        <CmdHeader cmd={`cat /var/log/mission/${e.slug}.md`} />
        <article style={{ marginTop: 24, maxWidth: 720 }}>
          <h1
            style={{
              fontSize: "clamp(28px,4vw,40px)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            {e.title}
          </h1>
          <div style={{ fontSize: 12, color: "var(--dim)", marginBottom: 24 }}>
            [{new Date(e.date).toISOString().slice(0, 10)}] · D{String(e.day).padStart(2, "0")} ·{" "}
            {e.readMinutes ?? 1} min read
          </div>
          {e.excerpt && (
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--fg)" }}>{e.excerpt}</p>
          )}
        </article>
      </section>
    </main>
  );
}
