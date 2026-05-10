import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("next/headers", () => ({
  headers: () => Promise.resolve(new Headers()),
}));

const { GET } = await import("@/app/api/github-stars/[owner]/[repo]/route");

describe("GET /api/github-stars", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it("returns stars on happy path", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ stargazers_count: 42 }), { status: 200 }),
      ),
    );
    const res = await GET(new Request("http://x/api/github-stars/o/r"), {
      params: Promise.resolve({ owner: "o", repo: "r" }),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ stars: 42 });
  });

  it("404 propagates as 404", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 404 })));
    const res = await GET(new Request("http://x/api/github-stars/o/r"), {
      params: Promise.resolve({ owner: "o", repo: "r" }),
    });
    expect(res.status).toBe(404);
  });

  it("400 on invalid params", async () => {
    const res = await GET(new Request("http://x"), {
      params: Promise.resolve({ owner: "../x", repo: "y" }),
    });
    expect(res.status).toBe(400);
  });
});
