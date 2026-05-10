import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    tokenExpiration: 7 * 24 * 60 * 60,
    cookies: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    },
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
  },
  admin: { useAsTitle: "email", defaultColumns: ["email", "role"] },
  access: {
    read: ({ req }) => Boolean(req.user) && req.user!.role === "admin",
    create: ({ req }) => Boolean(req.user) && req.user!.role === "admin",
    update: ({ req, id }) =>
      Boolean(req.user) && (req.user!.role === "admin" || String(req.user!.id) === String(id)),
    delete: ({ req }) => Boolean(req.user) && req.user!.role === "admin",
  },
  fields: [
    { name: "name", type: "text" },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "customer",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Customer", value: "customer" },
      ],
    },
  ],
};
