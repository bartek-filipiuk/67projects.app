import { beforeEach, vi } from "vitest";

beforeEach(() => {
  vi.useRealTimers();
});

process.env.NODE_ENV = "test";
process.env.PAYLOAD_SECRET = process.env.PAYLOAD_SECRET ?? "test-secret-32-bytes-aaaaaaaaaaaa";
process.env.DAILY_SALT_SECRET = process.env.DAILY_SALT_SECRET ?? "test-salt-32-bytes-bbbbbbbbbbbbbb";
process.env.NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";
