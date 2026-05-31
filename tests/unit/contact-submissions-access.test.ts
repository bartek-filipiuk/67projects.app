import { describe, it, expect } from "vitest";
import type { PayloadRequest } from "payload";
import { ContactSubmissions } from "@/collections/ContactSubmissions";

// Regression guard for auth-001 (HIGH): ContactSubmissions must only be
// creatable through Payload's Local API (used inside the rate-limited Server
// Action). A public `POST /api/contactSubmissions` (REST) or GraphQL mutation
// must be denied, otherwise the contactLimiter is bypassed and `ipHash` can be
// spoofed. See .security-audit/findings/auth-001.md.
const createAccess = ContactSubmissions.access?.create;

function canCreate(payloadAPI: PayloadRequest["payloadAPI"] | undefined) {
  if (!createAccess) {
    throw new Error("ContactSubmissions.access.create is not defined");
  }
  const req = { payloadAPI } as unknown as PayloadRequest;
  return createAccess({ req });
}

describe("ContactSubmissions access.create (auth-001 regression)", () => {
  it("allows create via Payload Local API", () => {
    expect(canCreate("local")).toBe(true);
  });

  it("denies create via public REST API", () => {
    expect(canCreate("REST")).toBe(false);
  });

  it("denies create via GraphQL API", () => {
    expect(canCreate("GraphQL")).toBe(false);
  });

  it("denies create when payloadAPI is absent", () => {
    expect(canCreate(undefined)).toBe(false);
  });
});
