import type { GlobalConfig } from "payload";

export const SiteSettings: GlobalConfig = {
  slug: "siteSettings",
  access: {
    read: () => true,
    update: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Status",
          fields: [
            { name: "totalRevenueCents", type: "number", defaultValue: 0, min: 0 },
            { name: "currentDay", type: "number", defaultValue: 1, min: 1, max: 67 },
            { name: "streakDays", type: "number", defaultValue: 0, min: 0 },
            { name: "nextShipAt", type: "date" },
            { name: "liveRevenueLog", type: "checkbox", defaultValue: true },
          ],
        },
        {
          label: "Branding",
          fields: [
            {
              name: "siteName",
              type: "text",
              required: true,
              defaultValue: "bartek@67projects",
              admin: { description: "Shown in nav header / terminal prompt user." },
            },
            {
              name: "metaTitle",
              type: "text",
              defaultValue: "67 Projects · bartek@67projects:~$",
            },
            {
              name: "metaDescription",
              type: "textarea",
              defaultValue:
                "67 micro-products in 67 days. Built with AI. One solo founder.",
            },
            {
              name: "bootText",
              type: "text",
              defaultValue: "Loading 67projects.app v0.1.0… OK.",
              admin: { description: "Top boot bar." },
            },
          ],
        },
        {
          label: "Hero",
          fields: [
            {
              name: "heroTitle",
              type: "textarea",
              required: true,
              defaultValue: "67 Projects.\nBuilt with AI.",
              admin: { description: "Use \\n for line break." },
            },
            {
              name: "heroSubtitle",
              type: "textarea",
              defaultValue:
                "One solo founder. Zero lines of code typed.\n67 micro-products for developers and creators. One at a time. No subscriptions.",
            },
            {
              name: "heroStatusLabel",
              type: "text",
              defaultValue: "shipping daily",
              admin: { description: "Value of `# status:` in hero meta row." },
            },
            {
              name: "heroMrrLabel",
              type: "text",
              defaultValue: "$0 (one-time only)",
            },
            {
              name: "heroPrimaryCta",
              type: "group",
              fields: [
                { name: "label", type: "text", defaultValue: "> BROWSE ALL PROJECTS" },
                { name: "href", type: "text", defaultValue: "/projects" },
              ],
            },
            {
              name: "heroSecondaryCta",
              type: "group",
              fields: [
                { name: "label", type: "text", defaultValue: "> READ THE LOG" },
                { name: "href", type: "text", defaultValue: "/log" },
              ],
            },
          ],
        },
        {
          label: "Sections",
          fields: [
            { name: "cmdLatestReleases", type: "text", defaultValue: "ls -la ./latest-releases" },
            { name: "cmdOpenSource", type: "text", defaultValue: "cat ./open-source.md" },
            { name: "cmdRevenueLog", type: "text", defaultValue: "tail -f ./revenue.log" },
            { name: "cmdChallenge", type: "text", defaultValue: "cat ./67-days-of-ai-magic.txt" },
            {
              name: "challengeCopy",
              type: "textarea",
              defaultValue:
                "Every day, one new product. Every day, one silent-coding video. For 67 days. The whole thing is a public bet that one solo founder + Claude Code can outship a five-person seed-stage team.",
            },
            { name: "nextShipText", type: "text", defaultValue: "tomorrow 09:00 UTC" },
          ],
        },
        {
          label: "Footer",
          fields: [
            { name: "footerCwd", type: "text", defaultValue: "/home/bartek/67projects" },
            { name: "footerCopyright", type: "text", defaultValue: "© MMXXVI bartek" },
            {
              name: "footerLinks",
              type: "array",
              defaultValue: [
                { label: "github.com/bartek-filipiuk", href: "https://github.com/bartek-filipiuk" },
                { label: "x.com/bartek67", href: "https://x.com/bartek67" },
                { label: "rss.xml", href: "/rss.xml" },
              ],
              fields: [
                { name: "label", type: "text", required: true },
                { name: "href", type: "text", required: true },
              ],
            },
          ],
        },
        {
          label: "Contact",
          fields: [
            {
              name: "contactFields",
              type: "array",
              labels: { singular: "Field", plural: "Fields" },
              defaultValue: [
                { key: "[email]", value: "bartek@67projects.app" },
                { key: "[twitter]", value: "@bartek67" },
                { key: "[github]", value: "bartek-filipiuk" },
                { key: "[linkedin]", value: "in/bartek67" },
                { key: "[response_sla]", value: "< 24h on weekdays" },
                { key: "[location]", value: "Warsaw, PL — UTC+1" },
              ],
              fields: [
                { name: "key", type: "text", required: true },
                { name: "value", type: "text", required: true },
              ],
            },
          ],
        },
      ],
    },
  ],
};
