import { getPayload } from "payload";
import config from "../payload.config";

const CATEGORIES = [
  { name: "Boilerplates", slug: "boilerplates", sortOrder: 1 },
  { name: "Dev Tools", slug: "dev-tools", sortOrder: 2 },
  { name: "Creator Economy", slug: "creator-economy", sortOrder: 3 },
];

const PROJECTS_RAW = [
  { slug: "mini-saas-boilerplate", name: "Mini SaaS Boilerplate", path: "/opt/67/mini-saas.yaml", priceCents: 9999, tag: "BESTSELLER", category: "boilerplates", description: "Next.js + Supabase + Stripe. Launch your SaaS this weekend. Save 40 hours of auth & billing setup.", shipped: "2026-04-22", day: 3 },
  { slug: "meme-tracker", name: "Meme Coin Tracker & Rug Pull Calculator", path: "/opt/67/meme-tracker.yaml", priceCents: 4999, tag: "HOT", category: "dev-tools", description: "Catch the next 100x before it rugs. Real-time Solana memecoin analytics with on-chain holder distribution.", shipped: "2026-05-01", day: 12 },
  { slug: "yt-chapters", name: "Offline YouTube Chapter Generator", path: "/opt/67/yt-chapters.yaml", priceCents: 1499, tag: "NEW", category: "creator-economy", description: "Drop your video. Get timestamps. 100% offline, zero subscriptions.", shipped: "2026-05-06", day: 14 },
  { slug: "chrome-ext-starter", name: "Chrome Extension Starter Kit", path: "/opt/67/chrome-ext.yaml", priceCents: 6200, tag: "BESTSELLER", category: "boilerplates", description: "Manifest V3, React popup, content scripts, and a payment-gated unlock flow. Ships in 30 minutes.", shipped: "2026-04-25", day: 6 },
  { slug: "json-formatter", name: "Offline JSON Formatter Pro", path: "/opt/67/json-formatter.yaml", priceCents: 599, tag: "NEW", category: "dev-tools", description: "Format, diff, query 200MB JSON files. Zero network calls, zero telemetry.", shipped: "2026-05-04", day: 11 },
  { slug: "regex-tester", name: "Regex Tester Desktop", path: "/opt/67/regex-tester.yaml", priceCents: 999, tag: "HOT", category: "dev-tools", description: "Native regex playground with pattern library, replace preview, and benchmark mode.", shipped: "2026-04-28", day: 9 },
  { slug: "port-manager", name: "Port Manager", path: "/opt/67/port-manager.yaml", priceCents: 799, tag: "", category: "dev-tools", description: "Kill stuck localhost ports without remembering lsof flags. macOS menu bar app.", shipped: "2026-04-26", day: 7 },
  { slug: "sponsor-calc", name: "YouTube Sponsorship Calculator", path: "/opt/67/sponsor-calc.yaml", priceCents: 1999, tag: "", category: "creator-economy", description: "Price your sponsor reads correctly. CPM tables, CTR multipliers, niche premiums.", shipped: "2026-04-30", day: 10 },
  { slug: "media-kit", name: "Creator Media Kit Generator", path: "/opt/67/media-kit.yaml", priceCents: 2499, tag: "NEW", category: "creator-economy", description: "Generate a sleek PDF media kit from your stats. 8 templates, brand colors, one-click export.", shipped: "2026-05-03", day: 13 },
  { slug: "digital-storefront", name: "Digital Storefront Kit", path: "/opt/67/storefront.yaml", priceCents: 7999, tag: "BESTSELLER", category: "creator-economy", description: "Sell digital downloads with Stripe. Customer portal, license keys, refund flow included.", shipped: "2026-04-23", day: 4 },
  { slug: "newsletter-referral", name: "Newsletter Referral System", path: "/opt/67/referral.yaml", priceCents: 3999, tag: "", category: "creator-economy", description: "Drop-in referral leaderboard for any newsletter. Beehiiv, ConvertKit, Substack adapters.", shipped: "2026-04-27", day: 8 },
  { slug: "fire-calc", name: "FIRE Calculator Pro", path: "/opt/67/fire-calc.yaml", priceCents: 1199, tag: "", category: "dev-tools", description: "Financial Independence Retire Early calculator with Monte Carlo, tax brackets, and SWR modeling.", shipped: "2026-04-21", day: 2 },
  { slug: "dating-roaster", name: "Dating Profile Roaster", path: "/opt/67/dating-roast.yaml", priceCents: 399, tag: "HOT", category: "creator-economy", description: "AI roasts your bio + photos. Brutal honesty mode unlocks 4x more matches.", shipped: "2026-05-05", day: 14 },
  { slug: "rug-watch", name: "RugWatch Solana Tracker", path: "/opt/67/rug-watch.yaml", priceCents: 2999, tag: "", category: "dev-tools", description: "Real-time honeypot detection. Alerts before liquidity vanishes.", shipped: "2026-04-20", day: 1 },
];

const REPOS = [
  { name: "codehelm", owner: "bartek-filipiuk", description: "Local web UI for Claude Code CLI sessions — read JSONL, spawn terminals, edit CLAUDE.md.", lang: "TypeScript", license: "MIT LICENSE", starsCached: 42 },
  { name: "blog-post-scraper", owner: "bartek-filipiuk", description: "Autonomous blog scraper with Playwright, BeautifulSoup, FastAPI. Use at your own risk.", lang: "Python", license: "EXPERIMENTAL", starsCached: 12 },
  { name: "silent-build", owner: "bartek-filipiuk", description: "Post-processing pipeline for viral silent-coding YouTube videos. Parses Claude Code .jsonl into NASA-style overlays.", lang: "Python", license: "MIT LICENSE", starsCached: 89 },
  { name: "claude-jsonl-parser", owner: "bartek-filipiuk", description: "Stream-parse Claude Code session logs. Tool calls, token counts, latency histograms.", lang: "Rust", license: "MIT LICENSE", starsCached: 27 },
  { name: "vibe-eslint", owner: "bartek-filipiuk", description: "ESLint preset for AI-generated code. Catches the patterns LLMs love that humans hate.", lang: "JavaScript", license: "MIT LICENSE", starsCached: 18 },
];

const LOGS = [
  { slug: "day-14-regex-12min", date: "2026-05-07", day: 14, title: "Day 14: How I built a Regex Tester in 12 minutes with Claude", excerpt: "Twelve minutes from prompt to App Store submission." },
  { slug: "day-13-media-kit", date: "2026-05-06", day: 13, title: "Day 13: Shipping the Media Kit Generator. The PDF render pipeline that almost killed me.", excerpt: "Server-side Chromium vs satori vs pdfkit." },
  { slug: "day-12-claude-named-it", date: "2026-05-05", day: 12, title: "Day 12: I let Claude name a product. The result is in production.", excerpt: "RugWatch was almost RugPullDetector9000." },
  { slug: "day-11-json-200mb", date: "2026-05-04", day: 11, title: "Day 11: JSON Formatter Pro — 200MB files, zero network calls", excerpt: "Streaming parser + virtualized tree view." },
  { slug: "day-10-pricing", date: "2026-05-03", day: 10, title: "Day 10: Pricing strategy for AI-generated software. The 50% rule.", excerpt: "Why I undercharge by half on purpose." },
  { slug: "day-9-yaml-stickers", date: "2026-05-02", day: 9, title: "Day 9: Why every product has a YAML config sticker on the homepage", excerpt: "Branding via /opt/67/*.yaml paths." },
  { slug: "day-8-meme-coin", date: "2026-05-01", day: 8, title: "Day 8: I shipped a meme coin tracker. Made $480 in 14 hours.", excerpt: "Crypto Twitter is a hell of a launch channel." },
  { slug: "day-7-faceless-yt", date: "2026-04-30", day: 7, title: "Day 7: Faceless YouTube — the silent-build pipeline explained", excerpt: "From .jsonl to viral in three render steps." },
  { slug: "day-6-postmortem", date: "2026-04-29", day: 6, title: "Day 6: When Claude is wrong. A debugging post-mortem.", excerpt: "The dependency that wasn't there." },
  { slug: "day-5-quitting", date: "2026-04-28", day: 5, title: "Day 5: Why I quit my job to ship 67 things in 67 days", excerpt: "Risk math + runway calculation." },
];

async function upsert(payload: Awaited<ReturnType<typeof getPayload>>, collection: string, where: Record<string, unknown>, data: Record<string, unknown>) {
  const found = await payload.find({ collection: collection as never, where: where as never, limit: 1 });
  if (found.totalDocs > 0) {
    return payload.update({ collection: collection as never, id: found.docs[0]!.id as never, data: data as never });
  }
  return payload.create({ collection: collection as never, data: data as never });
}

async function main() {
  const payload = await getPayload({ config });

  for (const c of CATEGORIES) await upsert(payload, "categories", { slug: { equals: c.slug } }, c);

  const cats = await payload.find({ collection: "categories", limit: 10 });
  const catIdBySlug: Record<string, string | number> = {};
  for (const c of cats.docs) catIdBySlug[c.slug] = c.id;

  for (const p of PROJECTS_RAW) {
    await upsert(payload, "projects", { slug: { equals: p.slug } }, {
      slug: p.slug, name: p.name, path: p.path, priceCents: p.priceCents,
      currency: "USD", tag: p.tag, category: catIdBySlug[p.category],
      description: p.description, shipped: p.shipped, day: p.day,
      buyersCount: 100 + Math.floor(Math.random() * 400),
      avgRating: Math.round((4.5 + Math.random() * 0.5) * 10) / 10,
      status: "published",
    });
  }

  for (const r of REPOS) {
    await upsert(payload, "repos", { name: { equals: r.name } }, {
      ...r, fullPath: `github.com/${r.owner}/${r.name}`,
      starsCachedAt: new Date().toISOString(), published: true,
    });
  }

  for (const e of LOGS) {
    await upsert(payload, "logEntries", { slug: { equals: e.slug } }, { ...e, published: true, readMinutes: 5 });
  }

  await payload.updateGlobal({
    slug: "siteSettings",
    data: { totalRevenueCents: 428742, currentDay: 14, streakDays: 14, liveRevenueLog: true },
  });

  console.log("✓ seed complete");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
