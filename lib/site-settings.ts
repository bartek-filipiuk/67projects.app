import { getPayload } from "payload";
import config from "@payload-config";

export interface SiteSettingsResolved {
  // Status
  totalRevenueCents: number;
  currentDay: number;
  streakDays: number;
  liveRevenueLog: boolean;

  // Branding
  siteName: string;
  metaTitle: string;
  metaDescription: string;
  bootText: string;

  // Hero
  heroTitle: string;
  heroSubtitle: string;
  heroStatusLabel: string;
  heroMrrLabel: string;
  heroPrimaryCta: { label: string; href: string };
  heroSecondaryCta: { label: string; href: string };

  // Sections
  cmdLatestReleases: string;
  cmdOpenSource: string;
  cmdRevenueLog: string;
  cmdChallenge: string;
  challengeCopy: string;
  nextShipText: string;

  // Footer
  footerCwd: string;
  footerCopyright: string;
  footerLinks: Array<{ label: string; href: string }>;

  // Contact
  contactFields: Array<{ key: string; value: string }>;
}

const FALLBACK: SiteSettingsResolved = {
  totalRevenueCents: 0,
  currentDay: 1,
  streakDays: 0,
  liveRevenueLog: true,

  siteName: "bartek@67projects",
  metaTitle: "67 Projects · bartek@67projects:~$",
  metaDescription: "67 micro-products. Built with AI. One solo founder.",
  bootText: "Loading 67projects.app v0.1.0… OK.",

  heroTitle: "67 Projects.\nBuilt with AI.",
  heroSubtitle:
    "One solo founder. Zero lines of code typed.\n67 micro-products for developers and creators. One at a time. No subscriptions.",
  heroStatusLabel: "shipping",
  heroMrrLabel: "$0 (one-time only)",
  heroPrimaryCta: { label: "> BROWSE ALL PROJECTS", href: "/projects" },
  heroSecondaryCta: { label: "> READ THE LOG", href: "/log" },

  cmdLatestReleases: "ls -la ./latest-releases",
  cmdOpenSource: "cat ./open-source.md",
  cmdRevenueLog: "tail -f ./revenue.log",
  cmdChallenge: "cat ./the-67-bet.txt",
  challengeCopy:
    "One product at a time. One silent-coding video per build. 67 products total — a public bet that one solo founder + Claude Code can outship a five-person seed-stage team.",
  nextShipText: "when it's ready",

  footerCwd: "/home/bartek/67projects",
  footerCopyright: "© MMXXVI bartek",
  footerLinks: [
    { label: "github.com/bartek-filipiuk", href: "https://github.com/bartek-filipiuk" },
    { label: "x.com/bartek67", href: "https://x.com/bartek67" },
    { label: "rss.xml", href: "/rss.xml" },
  ],
  contactFields: [
    { key: "[email]", value: "bartek@67projects.app" },
    { key: "[twitter]", value: "@bartek67" },
    { key: "[github]", value: "bartek-filipiuk" },
    { key: "[linkedin]", value: "in/bartek67" },
    { key: "[response_sla]", value: "< 24h on weekdays" },
    { key: "[location]", value: "Warsaw, PL — UTC+1" },
  ],
};

export async function getSiteSettings(): Promise<SiteSettingsResolved> {
  try {
    const payload = await getPayload({ config });
    const raw = await payload.findGlobal({ slug: "siteSettings" });
    return mergeWithFallback(raw as unknown as Record<string, unknown>);
  } catch {
    return FALLBACK;
  }
}

function mergeWithFallback(s: Record<string, unknown>): SiteSettingsResolved {
  const pick = <K extends keyof SiteSettingsResolved>(k: K): SiteSettingsResolved[K] => {
    const v = s[k as string];
    return (v ?? FALLBACK[k]) as SiteSettingsResolved[K];
  };
  return {
    totalRevenueCents: pick("totalRevenueCents"),
    currentDay: pick("currentDay"),
    streakDays: pick("streakDays"),
    liveRevenueLog: pick("liveRevenueLog"),
    siteName: pick("siteName"),
    metaTitle: pick("metaTitle"),
    metaDescription: pick("metaDescription"),
    bootText: pick("bootText"),
    heroTitle: pick("heroTitle"),
    heroSubtitle: pick("heroSubtitle"),
    heroStatusLabel: pick("heroStatusLabel"),
    heroMrrLabel: pick("heroMrrLabel"),
    heroPrimaryCta: pick("heroPrimaryCta"),
    heroSecondaryCta: pick("heroSecondaryCta"),
    cmdLatestReleases: pick("cmdLatestReleases"),
    cmdOpenSource: pick("cmdOpenSource"),
    cmdRevenueLog: pick("cmdRevenueLog"),
    cmdChallenge: pick("cmdChallenge"),
    challengeCopy: pick("challengeCopy"),
    nextShipText: pick("nextShipText"),
    footerCwd: pick("footerCwd"),
    footerCopyright: pick("footerCopyright"),
    footerLinks: pick("footerLinks"),
    contactFields: pick("contactFields"),
  };
}
