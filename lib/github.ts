import { githubRepoSchema } from "./validators";
import { env } from "./env";

export class GithubError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "GithubError";
  }
}

export async function fetchRepoStars(
  owner: string,
  repo: string,
  opts: { revalidate?: number } = {}
): Promise<number> {
  const parsed = githubRepoSchema.parse({ owner, repo });
  const url = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`;
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;

  const res = await fetch(url, {
    headers,
    next: { revalidate: opts.revalidate ?? 3600, tags: [`gh:${parsed.owner}/${parsed.repo}`] },
  } as RequestInit & { next?: { revalidate?: number; tags?: string[] } });

  if (!res.ok) throw new GithubError(`GitHub API ${res.status}`, res.status);
  const json = (await res.json()) as { stargazers_count?: number };
  if (typeof json.stargazers_count !== "number") {
    throw new GithubError("malformed response", 502);
  }
  return json.stargazers_count;
}
