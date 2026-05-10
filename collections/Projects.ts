import type { CollectionConfig } from "payload";

export const Projects: CollectionConfig = {
  slug: "projects",
  admin: { useAsTitle: "name", defaultColumns: ["name", "day", "status", "priceCents"] },
  access: {
    read: ({ req }) => {
      if (req.user?.role === "admin") return true;
      return { status: { equals: "published" } };
    },
    create: ({ req }) => req.user?.role === "admin",
    update: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      validate: (v: unknown) =>
        typeof v === "string" && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(v) ? true : "kebab-case only",
    },
    { name: "name", type: "text", required: true, maxLength: 120 },
    { name: "path", type: "text", required: true, maxLength: 200 },
    { name: "priceCents", type: "number", required: true, min: 0 },
    {
      name: "currency",
      type: "select",
      required: true,
      defaultValue: "USD",
      options: ["USD", "EUR", "PLN"],
    },
    {
      name: "tag",
      type: "select",
      defaultValue: "",
      options: [
        { label: "—", value: "" },
        { label: "BESTSELLER", value: "BESTSELLER" },
        { label: "HOT", value: "HOT" },
        { label: "NEW", value: "NEW" },
      ],
    },
    { name: "category", type: "relationship", relationTo: "categories", required: true },
    { name: "description", type: "textarea", required: true, maxLength: 500 },
    { name: "shipped", type: "date", required: true },
    { name: "day", type: "number", required: true, min: 1, max: 67 },
    { name: "features", type: "array", fields: [{ name: "text", type: "text", required: true }] },
    { name: "installSteps", type: "richText" },
    { name: "tree", type: "textarea" },
    { name: "buyersCount", type: "number", defaultValue: 0, min: 0 },
    { name: "avgRating", type: "number", defaultValue: 0, min: 0, max: 5 },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "draft",
      options: ["draft", "published", "archived"],
      index: true,
    },
  ],
};
