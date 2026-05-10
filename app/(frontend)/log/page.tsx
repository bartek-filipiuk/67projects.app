import Link from "next/link";
import { getPayload } from "payload";
import config from "@payload-config";
import { CmdHeader } from "@/components/primitives/CmdHeader";

export const revalidate = 600;

interface LogEntryDoc {
  slug: string;
  date: string;
  day: number;
  title: string;
  readMinutes?: number | null;
}

export default async function LogPage() {
  let docs: LogEntryDoc[] = [];
  try {
    const payload = await getPayload({ config });
    const r = await payload.find({
      collection: "logEntries",
      where: { published: { equals: true } },
      sort: "-date",
      limit: 100,
    });
    docs = r.docs as unknown as LogEntryDoc[];
  } catch {
    /* DB unavailable */
  }
  return (
    <main style={{ padding: "0 0 80px" }}>
      <section style={{ padding: "56px 0 8px" }}>
        <CmdHeader cmd="tail -n 100 /var/log/mission.log" />
        <div
          style={{
            fontSize: 12,
            color: "var(--dim)",
            margin: "6px 0 24px",
            paddingLeft: 18,
          }}
        >
          {docs.length} entries
        </div>
        <div style={{ borderTop: "2px solid var(--border)", borderBottom: "2px solid var(--border)" }}>
          {docs.map((e) => (
            <Link key={e.slug} href={`/log/${e.slug}`} className="log-entry">
              <span style={{ color: "var(--dim)", fontSize: 12 }}>
                [{new Date(e.date).toISOString().slice(0, 10)}]
              </span>
              <span style={{ fontWeight: 800, fontSize: 12 }}>D{String(e.day).padStart(2, "0")}</span>
              <span style={{ fontWeight: 600 }}>{e.title}</span>
              <span style={{ fontSize: 11, color: "var(--dim)", textAlign: "right" }}>
                {e.readMinutes ?? 1} min read
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
