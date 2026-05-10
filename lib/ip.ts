import { createHash } from "node:crypto";
import { env } from "./env";

function dailySalt(date = new Date()): string {
  const day = date.toISOString().slice(0, 10);
  return `${env.DAILY_SALT_SECRET}:${day}`;
}

export function hashIp(ip: string, date?: Date): string {
  return createHash("sha256").update(`${dailySalt(date)}|${ip}`).digest("hex");
}

export function getClientIp(headers: Headers, trustProxy: boolean): string {
  if (trustProxy) {
    const xff = headers.get("x-forwarded-for");
    if (xff) {
      const first = xff.split(",")[0]?.trim();
      if (first) return first;
    }
    const real = headers.get("x-real-ip");
    if (real) return real.trim();
  }
  return "0.0.0.0";
}
