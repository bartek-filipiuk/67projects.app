import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/sales-stream/route";

describe("GET /api/sales-stream", () => {
  it("returns SSE response with seed", async () => {
    const ctrl = new AbortController();
    const res = await GET(new Request("http://x/api/sales-stream", { signal: ctrl.signal }));
    expect(res.headers.get("content-type")).toMatch(/text\/event-stream/);
    expect(res.status).toBe(200);
    const reader = res.body!.getReader();
    const { value } = await reader.read();
    const text = new TextDecoder().decode(value);
    expect(text).toMatch(/event: sale\ndata: /);
    await reader.cancel();
    ctrl.abort();
  });
});
