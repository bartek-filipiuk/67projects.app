import type { CollectionConfig } from "payload";

const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/avif"];

export const Media: CollectionConfig = {
  slug: "media",
  upload: {
    staticDir: "media",
    mimeTypes: ALLOWED,
    imageSizes: [
      { name: "thumb", width: 320, height: 320, position: "centre" },
      { name: "card", width: 800 },
      { name: "hero", width: 1600 },
    ],
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === "admin",
    update: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [{ name: "alt", type: "text", required: true }],
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        if (req.file && !ALLOWED.includes(req.file.mimetype)) {
          throw new Error(`MIME type ${req.file.mimetype} not allowed`);
        }
        return data;
      },
    ],
  },
};
