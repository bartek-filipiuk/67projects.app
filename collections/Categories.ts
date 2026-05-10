import type { CollectionConfig } from "payload";

export const Categories: CollectionConfig = {
  slug: "categories",
  admin: { useAsTitle: "name", defaultColumns: ["name", "slug", "sortOrder"] },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === "admin",
    update: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    { name: "name", type: "text", required: true, unique: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "sortOrder", type: "number", defaultValue: 0 },
  ],
};
