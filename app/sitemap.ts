import type { MetadataRoute } from "next";
import { getPayload } from "payload";
import config from "@payload-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";
  const payload = await getPayload({ config });
  const [projects, entries] = await Promise.all([
    payload.find({
      collection: "projects",
      where: { status: { equals: "published" } },
      limit: 200,
    }),
    payload.find({
      collection: "logEntries",
      where: { published: { equals: true } },
      limit: 200,
    }),
  ]);
  return [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/projects`, priority: 0.9 },
    { url: `${base}/open-source`, priority: 0.8 },
    { url: `${base}/log`, priority: 0.8 },
    { url: `${base}/contact`, priority: 0.5 },
    ...projects.docs.map((p) => ({ url: `${base}/projects/${p.slug}`, priority: 0.7 })),
    ...entries.docs.map((e) => ({ url: `${base}/log/${e.slug}`, priority: 0.6 })),
  ];
}
