import type { CollectionConfig } from "payload";
import { revalidatePaths } from "../lib/revalidate";

export const LogEntries: CollectionConfig = {
  slug: "logEntries",
  admin: { useAsTitle: "title", defaultColumns: ["date", "day", "title", "published"] },
  access: {
    read: ({ req }) => {
      if (req.user?.role === "admin") return true;
      return { published: { equals: true } };
    },
    create: ({ req }) => req.user?.role === "admin",
    update: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "date", type: "date", required: true },
    { name: "day", type: "number", required: true, min: 1, max: 67 },
    { name: "title", type: "text", required: true, maxLength: 180 },
    { name: "excerpt", type: "textarea", maxLength: 200 },
    { name: "body", type: "richText" },
    { name: "readMinutes", type: "number", defaultValue: 1, min: 1 },
    { name: "published", type: "checkbox", defaultValue: false, index: true },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.body) {
          const text = JSON.stringify(data.body);
          const words = (text.match(/\b\w+\b/g) || []).length;
          data.readMinutes = Math.max(1, Math.round(words / 220));
        }
        return data;
      },
    ],
    afterChange: [
      ({ doc }) => revalidatePaths("/log", `/log/${doc.slug}`),
    ],
    afterDelete: [
      ({ doc }) => revalidatePaths("/log", `/log/${doc.slug}`),
    ],
  },
};
