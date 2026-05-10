import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Users } from "./collections/Users";
import { Categories } from "./collections/Categories";
import { Projects } from "./collections/Projects";
import { Repos } from "./collections/Repos";
import { LogEntries } from "./collections/LogEntries";
import { ContactSubmissions } from "./collections/ContactSubmissions";
import { Media } from "./collections/Media";
import { SiteSettings } from "./globals/SiteSettings";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: " — 67projects admin" },
  },
  collections: [Users, Categories, Projects, Repos, LogEntries, ContactSubmissions, Media],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL },
  }),
  cors: [process.env.NEXT_PUBLIC_SERVER_URL || ""].filter(Boolean),
  csrf: [process.env.NEXT_PUBLIC_SERVER_URL || ""].filter(Boolean),
});
