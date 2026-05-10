export interface Sale {
  time: string;
  amount: number;
  product: string;
  country: string;
  channel: "Stripe" | "Gumroad";
  type?: "payment" | "refund";
}

export interface SseEvent {
  type: string;
  payload: unknown;
}

export function encodeSseEvent(ev: SseEvent | null): string {
  if (ev === null) return ":heartbeat\n\n";
  return `event: ${ev.type}\ndata: ${JSON.stringify(ev.payload)}\n\n`;
}

const PRODUCTS = [
  "Mini SaaS Boilerplate",
  "Offline YouTube Chapter Generator",
  "Regex Tester Desktop",
  "Digital Storefront Kit",
  "JSON Formatter Pro",
  "Media Kit Generator",
  "Dating Profile Roaster",
];
const COUNTRIES = ["US", "DE", "GB", "JP", "PL", "CA", "AU", "BR"] as const;
const PRICES = [3.99, 5.99, 7.99, 9.99, 11.99, 14.99, 19.99, 24.99, 29.99, 39.99, 49.99, 62, 79.99, 99.99];

function pick<T>(arr: readonly T[]): T {
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx]!;
}

export function generateMockSale(): Sale {
  return {
    time: new Date().toTimeString().slice(0, 8),
    amount: pick(PRICES),
    product: pick(PRODUCTS),
    country: pick(COUNTRIES),
    channel: Math.random() > 0.3 ? "Stripe" : "Gumroad",
    type: "payment",
  };
}

export const RECENT_SEED: Sale[] = [
  { time: "14:32:01", amount: 49.99, product: "Mini SaaS Boilerplate", country: "US", channel: "Stripe", type: "payment" },
  { time: "14:18:44", amount: 14.99, product: "Offline YouTube Chapter Generator", country: "DE", channel: "Stripe", type: "payment" },
  { time: "13:47:12", amount: 9.99, product: "Regex Tester Desktop", country: "JP", channel: "Gumroad", type: "payment" },
  { time: "13:22:08", amount: 99.99, product: "Mini SaaS Boilerplate", country: "GB", channel: "Stripe", type: "payment" },
  { time: "12:55:33", amount: 5.99, product: "JSON Formatter Pro", country: "BR", channel: "Stripe", type: "refund" },
  { time: "12:41:19", amount: 79.99, product: "Digital Storefront Kit", country: "CA", channel: "Stripe", type: "payment" },
  { time: "11:58:02", amount: 3.99, product: "Dating Profile Roaster", country: "AU", channel: "Gumroad", type: "payment" },
  { time: "11:14:50", amount: 24.99, product: "Media Kit Generator", country: "PL", channel: "Stripe", type: "payment" },
];

export function formatSaleLine(sale: Sale): string {
  const amt = `$${sale.amount.toFixed(2)}`;
  const verb = sale.type === "refund" ? "Refund processed -" : "Payment received -";
  return `${verb} ${amt} for ${sale.product}`;
}
