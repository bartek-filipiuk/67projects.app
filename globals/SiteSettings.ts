import type { GlobalConfig } from "payload";

export const SiteSettings: GlobalConfig = {
  slug: "siteSettings",
  access: {
    read: () => true,
    update: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    { name: "totalRevenueCents", type: "number", defaultValue: 0, min: 0 },
    { name: "currentDay", type: "number", defaultValue: 1, min: 1, max: 67 },
    { name: "streakDays", type: "number", defaultValue: 0, min: 0 },
    { name: "nextShipAt", type: "date" },
    { name: "liveRevenueLog", type: "checkbox", defaultValue: true },
  ],
};
