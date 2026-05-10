import { getPayload } from "payload";
import config from "@payload-config";
import { Hero } from "@/components/home/Hero";
import { ChallengeGrid } from "@/components/home/ChallengeGrid";
import { RevenueLogStream } from "@/components/home/RevenueLogStream";
import { ProductCard } from "@/components/product/ProductCard";
import { RepoCard } from "@/components/repo/RepoCard";
import { CmdHeader } from "@/components/primitives/CmdHeader";
import { RECENT_SEED } from "@/lib/revenue-stream";

export const revalidate = 300;

export default async function HomePage() {
  const payload = await getPayload({ config });

  const [latestProjects, repos, settings] = await Promise.all([
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
    payload.findGlobal({ slug: "siteSettings" }),
  ]);

  return (
    <main style={{ padding: "0 0 80px" }}>
      <Hero
        currentDay={settings.currentDay ?? 14}
        total={67}
        totalRevenueCents={settings.totalRevenueCents ?? 0}
        streak={settings.streakDays ?? 14}
      />

      <section style={{ padding: "56px 0 8px" }}>
        <CmdHeader cmd="ls -la ./latest-releases" />
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
        <CmdHeader cmd="cat ./open-source.md" />
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

      {settings.liveRevenueLog && <RevenueLogStream initial={RECENT_SEED} />}

      <ChallengeGrid doneDays={settings.currentDay ?? 14} />
    </main>
  );
}
