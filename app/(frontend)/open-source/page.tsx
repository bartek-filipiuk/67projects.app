import { getPayload } from "payload";
import config from "@payload-config";
import { CmdHeader } from "@/components/primitives/CmdHeader";
import { RepoCard } from "@/components/repo/RepoCard";

export const revalidate = 3600;

export default async function OpenSourcePage() {
  const payload = await getPayload({ config });
  const r = await payload.find({
    collection: "repos",
    where: { published: { equals: true } },
    sort: "-starsCached",
    limit: 50,
  });
  return (
    <main style={{ padding: "0 0 80px" }}>
      <section style={{ padding: "56px 0 8px" }}>
        <CmdHeader cmd="curl https://api.github.com/users/bartek-filipiuk/repos" />
        <div
          style={{
            fontSize: 12,
            color: "var(--dim)",
            margin: "6px 0 24px",
            paddingLeft: 18,
          }}
        >
          200 OK · {r.docs.length} repos
        </div>
        <div className="grid-3">
          {r.docs.map((p) => (
            <RepoCard
              key={p.name}
              p={{
                name: p.name,
                fullPath: p.fullPath ?? `github.com/${p.owner}/${p.name}`,
                description: p.description,
                lang: p.lang,
                starsCached: p.starsCached ?? 0,
                license: p.license,
              }}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
