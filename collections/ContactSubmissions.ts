import type { CollectionConfig } from "payload";

export const ContactSubmissions: CollectionConfig = {
  slug: "contactSubmissions",
  admin: { useAsTitle: "name", defaultColumns: ["name", "createdAt"] },
  access: {
    read: ({ req }) => req.user?.role === "admin",
    create: () => true,
    update: () => false,
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    { name: "name", type: "text", required: true, maxLength: 80 },
    { name: "message", type: "textarea", required: true, maxLength: 2000 },
    { name: "ipHash", type: "text" },
    { name: "userAgent", type: "text", maxLength: 500 },
  ],
  timestamps: true,
};
