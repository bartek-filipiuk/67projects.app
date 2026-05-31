import { getPayload } from "payload";
import config from "@payload-config";
import { Hero } from "@/components/home/Hero";
import { ChallengeGrid } from "@/components/home/ChallengeGrid";
import { RevenueLogStream } from "@/components/home/RevenueLogStream";
import { ProductCard } from "@/components/product/ProductCard";
import { RepoCard } from "@/components/repo/RepoCard";
import { CmdHeader } from "@/components/primitives/CmdHeader";
import { RECENT_SEED } from "@/lib/revenue-stream";
import { getSiteSettings } from "@/lib/site-settings";

export const revalidate = 300;

const TOTAL_PROJECTS = 67;

export default async function HomePage() {
  const s = await getSiteSettings();

  interface ProjectDoc {
    slug: string;
    name: string;
    path: string;
    priceCents: number;
    currency: string;
    description: string;
    tag?: string | null;
  }
  interface RepoDoc {
    name: string;
    owner: string;
    fullPath?: string | null;
    description: string;
    lang: string;
    starsCached?: number | null;
    license: string;
  }

  let latestProjects: { docs: ProjectDoc[] } = { docs: [] };
  let repos: { docs: RepoDoc[] } = { docs: [] };
  // Number of shipped (published) projects — drives the "X / 67 shipped" counter.
  let shippedCount = 0;
  try {
    const payload = await getPayload({ config });
    const [pj, rp] = await Promise.all([
      payload.find({
        collection: "projects",
        where: { status: { equals: "published" } },
        sort: "-day",
        limit: 3,
      }),
      payload.find({
        collection: "repos",
        where: { published: { equals: true } },
        sort: "-starsCached",
        limit: 3,
      }),
    ]);
    latestProjects = { docs: pj.docs as unknown as ProjectDoc[] };
    repos = { docs: rp.docs as unknown as RepoDoc[] };
    // totalDocs is the full count of matching docs, independent of `limit`.
    shippedCount = pj.totalDocs;
  } catch {
    /* DB unavailable during build — render empty; ISR will re-query at runtime */
  }

  return (
    <main style={{ padding: "0 0 80px" }}>
      <Hero
        title={s.heroTitle}
        subtitle={s.heroSubtitle}
        shipped={shippedCount}
        total={TOTAL_PROJECTS}
        totalRevenueCents={s.totalRevenueCents}
        statusLabel={s.heroStatusLabel}
        mrrLabel={s.heroMrrLabel}
        primaryCta={s.heroPrimaryCta}
        secondaryCta={s.heroSecondaryCta}
      />

      <section style={{ padding: "56px 0 8px" }}>
        <CmdHeader cmd={s.cmdLatestReleases} />
        <div className="grid-3" style={{ marginTop: 24 }}>
          {latestProjects.docs.map((p) => (
            <ProductCard
              key={p.slug}
              p={{
                slug: p.slug,
                name: p.name,
                path: p.path,
                priceCents: p.priceCents,
                currency: p.currency as "USD" | "EUR" | "PLN",
                description: p.description,
                tag: (p.tag as "BESTSELLER" | "HOT" | "NEW" | "" | null) ?? "",
              }}
            />
          ))}
        </div>
      </section>

      <section style={{ padding: "56px 0 8px" }}>
        <CmdHeader cmd={s.cmdOpenSource} />
        <div className="grid-3" style={{ marginTop: 24 }}>
          {repos.docs.map((r) => (
            <RepoCard
              key={r.name}
              p={{
                name: r.name,
                fullPath: r.fullPath ?? `github.com/${r.owner}/${r.name}`,
                description: r.description,
                lang: r.lang,
                starsCached: r.starsCached ?? 0,
                license: r.license,
              }}
            />
          ))}
        </div>
      </section>

      {s.liveRevenueLog && (
        <RevenueLogStream initial={RECENT_SEED} cmd={s.cmdRevenueLog} />
      )}

      <ChallengeGrid
        shipped={shippedCount}
        total={TOTAL_PROJECTS}
        cmd={s.cmdChallenge}
        copy={s.challengeCopy}
        nextShipText={s.nextShipText}
      />
    </main>
  );
}
