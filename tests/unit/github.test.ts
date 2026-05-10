import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchRepoStars, GithubError } from "@/lib/github";

describe("fetchRepoStars", () => {
  beforeEach(() => { vi.restoreAllMocks(); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("returns stargazers_count on 200", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ stargazers_count: 42 }), { status: 200 })
    ));
    expect(await fetchRepoStars("a", "b")).toBe(42);
  });

  it("throws GithubError on 404", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("nope", { status: 404 })));
    await expect(fetchRepoStars("a", "b")).rejects.toBeInstanceOf(GithubError);
  });

  it("rejects bad input before fetch", async () => {
    const f = vi.fn();
    vi.stubGlobal("fetch", f);
    await expect(fetchRepoStars("../x", "y")).rejects.toThrow();
    expect(f).not.toHaveBeenCalled();
  });

  it("throws on malformed response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 200 })));
    await expect(fetchRepoStars("a", "b")).rejects.toBeInstanceOf(GithubError);
  });
});
