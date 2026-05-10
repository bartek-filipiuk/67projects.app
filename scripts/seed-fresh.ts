/**
 * Idempotent fresh-start seed for production.
 * Inserts the 3 base categories and ensures SiteSettings has the launch state.
 * Does NOT insert demo projects/repos/log entries — those are added by Bartek via admin.
 *
 * Safe to run on every container start.
 */
import { getPayload } from "payload";
import config from "../payload.config";

const CATEGORIES = [
  { name: "Boilerplates", slug: "boilerplates", sortOrder: 1 },
  { name: "Dev Tools", slug: "dev-tools", sortOrder: 2 },
  { name: "Creator Economy", slug: "creator-economy", sortOrder: 3 },
];

const FRESH_SITE_SETTINGS = {
  // Status — launch state
  totalRevenueCents: 0,
  currentDay: 1,
  streakDays: 0,
  liveRevenueLog: false, // hide live feed until Stripe webhook is wired up

  // Branding — defaults aligned with collection schema defaults
  siteName: "bartek@67projects",
  metaTitle: "67 Projects · bartek@67projects:~$",
  metaDescription: "67 micro-products in 67 days. Built with AI. One solo founder.",
  bootText: "Loading 67projects.app v0.1.0… OK.",

  // Hero
  heroTitle: "67 Projects.\nBuilt with AI.",
  heroSubtitle:
    "One solo founder. Zero lines of code typed.\n67 micro-products for developers and creators. One at a time. No subscriptions.",
  heroStatusLabel: "shipping daily",
  heroMrrLabel: "$0 (one-time only)",
  heroPrimaryCta: { label: "> BROWSE ALL PROJECTS", href: "/projects" },
  heroSecondaryCta: { label: "> READ THE LOG", href: "/log" },

  // Sections
  cmdLatestReleases: "ls -la ./latest-releases",
  cmdOpenSource: "cat ./open-source.md",
  cmdRevenueLog: "tail -f ./revenue.log",
  cmdChallenge: "cat ./67-days-of-ai-magic.txt",
  challengeCopy:
    "Every day, one new product. Every day, one silent-coding video. For 67 days. The whole thing is a public bet that one solo founder + Claude Code can outship a five-person seed-stage team.",
  nextShipText: "TBA",

  // Footer
  footerCwd: "/home/bartek/67projects",
  footerCopyright: "© MMXXVI bartek",
  footerLinks: [
    { label: "github.com/bartek-filipiuk", href: "https://github.com/bartek-filipiuk" },
    { label: "x.com/bartek67", href: "https://x.com/bartek67" },
    { label: "rss.xml", href: "/rss.xml" },
  ],

  // Contact
  contactFields: [
    { key: "[email]", value: "bartek@67projects.app" },
    { key: "[twitter]", value: "@bartek67" },
    { key: "[github]", value: "bartek-filipiuk" },
    { key: "[linkedin]", value: "in/bartek67" },
    { key: "[response_sla]", value: "< 24h on weekdays" },
    { key: "[location]", value: "Warsaw, PL — UTC+1" },
  ],
};

async function upsert(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: string,
  where: Record<string, unknown>,
  data: Record<string, unknown>,
) {
  const found = await payload.find({ collection: collection as never, where: where as never, limit: 1 });
  if (found.totalDocs > 0) {
    const id = (found.docs[0] as unknown as { id: string | number }).id;
    return payload.update({ collection: collection as never, id: id as never, data: data as never });
  }
  return payload.create({ collection: collection as never, data: data as never });
}

async function main() {
  const payload = await getPayload({ config });

  for (const c of CATEGORIES) {
    await upsert(payload, "categories", { slug: { equals: c.slug } }, c);
  }

  // SiteSettings: only update fields if global is fresh (no totalRevenueCents > 0).
  // Once Bartek has real data, we don't want a redeploy to wipe it.
  const current = (await payload.findGlobal({ slug: "siteSettings" })) as {
    totalRevenueCents?: number;
    siteName?: string;
  };
  const isFresh =
    !current ||
    (current.totalRevenueCents ?? 0) === 0 ||
    !current.siteName;

  if (isFresh) {
    await payload.updateGlobal({ slug: "siteSettings", data: FRESH_SITE_SETTINGS });
    console.log("✓ seed-fresh: 3 categories + clean SiteSettings");
  } else {
    console.log("✓ seed-fresh: categories ensured; SiteSettings preserved (already populated)");
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("seed-fresh failed:", e);
    process.exit(1);
  });
