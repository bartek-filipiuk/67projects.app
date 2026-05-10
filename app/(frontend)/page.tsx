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

export default async function HomePage() {
  const payload = await getPayload({ config });
  const s = await getSiteSettings();

  const [latestProjects, repos] = await Promise.all([
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

  return (
    <main style={{ padding: "0 0 80px" }}>
      <Hero
        title={s.heroTitle}
        subtitle={s.heroSubtitle}
        currentDay={s.currentDay}
        total={67}
        totalRevenueCents={s.totalRevenueCents}
        streak={s.streakDays}
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
        doneDays={s.currentDay}
        cmd={s.cmdChallenge}
        copy={s.challengeCopy}
        nextShipText={s.nextShipText}
      />
    </main>
  );
}
