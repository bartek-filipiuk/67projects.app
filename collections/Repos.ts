import type { CollectionConfig } from "payload";

export const Repos: CollectionConfig = {
  slug: "repos",
  admin: { useAsTitle: "name", defaultColumns: ["name", "owner", "starsCached", "license"] },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === "admin",
    update: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    { name: "name", type: "text", required: true, unique: true, index: true },
    { name: "owner", type: "text", required: true },
    { name: "fullPath", type: "text", admin: { readOnly: true } },
    { name: "description", type: "textarea", required: true, maxLength: 300 },
    { name: "lang", type: "text", required: true },
    {
      name: "license",
      type: "select",
      required: true,
      defaultValue: "MIT LICENSE",
      options: ["MIT LICENSE", "APACHE 2.0", "ISC", "UNLICENSE", "EXPERIMENTAL", "PROPRIETARY"],
    },
    { name: "starsCached", type: "number", defaultValue: 0, min: 0 },
    { name: "starsCachedAt", type: "date" },
    { name: "published", type: "checkbox", defaultValue: true, index: true },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.owner && data.name) data.fullPath = `github.com/${data.owner}/${data.name}`;
        return data;
      },
    ],
  },
};
