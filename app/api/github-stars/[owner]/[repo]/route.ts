import { NextResponse } from "next/server";
import { fetchRepoStars, GithubError } from "@/lib/github";
import { githubRepoSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const revalidate = 3600;

interface Ctx {
  params: Promise<{ owner: string; repo: string }>;
}

export async function GET(_req: Request, { params }: Ctx) {
  const p = await params;
  const parsed = githubRepoSchema.safeParse(p);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid params" }, { status: 400 });
  }
  try {
    const stars = await fetchRepoStars(parsed.data.owner, parsed.data.repo, { revalidate: 3600 });
    return NextResponse.json(
      { stars },
      {
        headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
      },
    );
  } catch (e) {
    if (e instanceof GithubError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
