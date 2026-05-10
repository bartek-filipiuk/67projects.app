import { describe, it, expect } from "vitest";
import { encodeSseEvent, generateMockSale, RECENT_SEED, formatSaleLine } from "@/lib/revenue-stream";

describe("encodeSseEvent", () => {
  it("encodes data event", () => {
    expect(encodeSseEvent({ type: "sale", payload: { amount: 9.99 } }))
      .toMatch(/^event: sale\ndata: {.+}\n\n$/);
  });
  it("encodes heartbeat as comment", () => {
    expect(encodeSseEvent(null)).toBe(":heartbeat\n\n");
  });
});

describe("generateMockSale", () => {
  it("produces required fields", () => {
    const sale = generateMockSale();
    expect(sale.amount).toBeGreaterThan(0);
    expect(sale.product).toBeTruthy();
    expect(["US","DE","GB","JP","PL","CA","AU","BR"]).toContain(sale.country);
    expect(["Stripe","Gumroad"]).toContain(sale.channel);
  });
});

describe("RECENT_SEED", () => {
  it("has at least 5 entries", () => { expect(RECENT_SEED.length).toBeGreaterThanOrEqual(5); });
});

describe("formatSaleLine", () => {
  it("renders payment line", () => {
    expect(formatSaleLine({ time: "12:00:00", amount: 9.99, product: "Foo", country: "US", channel: "Stripe", type: "payment" }))
      .toMatch(/Payment received - \$9\.99 for Foo/);
  });
  it("renders refund line", () => {
    expect(formatSaleLine({ time: "12:00:00", amount: 5.99, product: "Bar", country: "BR", channel: "Stripe", type: "refund" }))
      .toMatch(/Refund processed - \$5\.99/);
  });
});
