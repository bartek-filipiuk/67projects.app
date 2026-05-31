/**
 * Idempotent fresh-start seed for production.
 * Inserts the 3 base categories and ensures SiteSettings has the launch state.
 * Does NOT insert demo projects/repos/log entries — those are added by Bartek via admin.
 *
 * Safe to run on every container start: categories are created only if missing,
 * and SiteSettings is written only on the very first run (before the global is
 * ever persisted) so that redeploys never overwrite admin edits.
 */
import { getPayload } from "payload";
import config from "../payload.config";
import { shouldInitializeSiteSettings } from "../lib/seed-guard";

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
  metaDescription: "67 micro-products. Built with AI. One solo founder.",
  bootText: "Loading 67projects.app v0.1.0… OK.",

  // Hero
  heroTitle: "67 Projects.\nBuilt with AI.",
  heroSubtitle:
    "One solo founder. Zero lines of code typed.\n67 micro-products for developers and creators. One at a time. No subscriptions.",
  heroStatusLabel: "shipping",
  heroMrrLabel: "$0 (one-time only)",
  heroPrimaryCta: { label: "> BROWSE ALL PROJECTS", href: "/projects" },
  heroSecondaryCta: { label: "> READ THE LOG", href: "/log" },

  // Sections
  cmdLatestReleases: "ls -la ./latest-releases",
  cmdOpenSource: "cat ./open-source.md",
  cmdRevenueLog: "tail -f ./revenue.log",
  cmdChallenge: "cat ./the-67-bet.txt",
  challengeCopy:
    "One product at a time. One silent-coding video per build. 67 products total — a public bet that one solo founder + Claude Code can outship a five-person seed-stage team.",
  nextShipText: "when it's ready",

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

async function main() {
  const payload = await getPayload({ config });

  // Categories: create only if missing. Never update an existing one — the admin
  // may have renamed it, and a redeploy must not revert that.
  for (const c of CATEGORIES) {
    const found = await payload.find({
      collection: "categories",
      where: { slug: { equals: c.slug } },
      limit: 1,
    });
    if (found.totalDocs === 0) {
      await payload.create({ collection: "categories", data: c });
    }
  }

  // SiteSettings: write defaults ONLY on first run (global never persisted).
  // Once persisted (by this seed or by an admin edit), leave it untouched.
  const current = await payload.findGlobal({ slug: "siteSettings" });
  if (shouldInitializeSiteSettings(current)) {
    await payload.updateGlobal({ slug: "siteSettings", data: FRESH_SITE_SETTINGS });
    console.log("✓ seed-fresh: categories ensured; SiteSettings initialized (first run)");
  } else {
    console.log("✓ seed-fresh: categories ensured; SiteSettings preserved (admin-owned)");
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("seed-fresh failed:", e);
    process.exit(1);
  });
