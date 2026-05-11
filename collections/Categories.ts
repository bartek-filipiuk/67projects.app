import type { CollectionConfig } from "payload";
import { revalidatePaths } from "../lib/revalidate";

export const Categories: CollectionConfig = {
  slug: "categories",
  admin: { useAsTitle: "name", defaultColumns: ["name", "slug", "sortOrder"] },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === "admin",
    update: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
  hooks: {
    afterChange: [() => revalidatePaths("/projects")],
    afterDelete: [() => revalidatePaths("/projects")],
  },
  fields: [
    { name: "name", type: "text", required: true, unique: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "sortOrder", type: "number", defaultValue: 0 },
  ],
};
