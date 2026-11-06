import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import type { Field } from "payload";
import { Categories } from "@/collections/Categories";
import { LogEntries } from "@/collections/LogEntries";
import { Media } from "@/collections/Media";
import { Projects } from "@/collections/Projects";
import { Repos } from "@/collections/Repos";
import { Users } from "@/collections/Users";
import { SiteSettings } from "@/globals/SiteSettings";
import { middleware } from "@/middleware";
import { MEDIA_CSP } from "@/lib/media-csp";

// Regression guard: the Users collection has a "customer" role, so content
// writes must stay gated on role === "admin" (not just "logged in").
/* eslint-disable @typescript-eslint/no-explicit-any */
const anon = { req: { user: null } } as any;
const customer = { req: { user: { id: 2, role: "customer" } } } as any;
const admin = { req: { user: { id: 1, role: "admin" } } } as any;

const contentCollections = { Categories, LogEntries, Media, Projects, Repos };

describe("content write access", () => {
  for (const [name, c] of Object.entries(contentCollections)) {
    for (const op of ["create", "update", "delete"] as const) {
      it(`${name}.${op}: anon and customer denied, admin allowed`, async () => {
        const fn = (c.access as any)?.[op];
        expect(typeof fn).toBe("function");
        expect(await fn(anon)).toBe(false);
        expect(await fn(customer)).toBe(false);
        expect(await fn(admin)).toBe(true);
      });
    }
  }

  it("SiteSettings.update: anon and customer denied, admin allowed", async () => {
    const fn = (SiteSettings.access as any).update;
    expect(await fn(anon)).toBe(false);
    expect(await fn(customer)).toBe(false);
    expect(await fn(admin)).toBe(true);
  });

  it("Projects.read: non-admin sees published only", async () => {
    const read = (Projects.access as any).read;
    expect(await read(customer)).toEqual({ status: { equals: "published" } });
    expect(await read(anon)).toEqual({ status: { equals: "published" } });
    expect(await read(admin)).toBe(true);
  });

  it("LogEntries.read: non-admin sees published only", async () => {
    const read = (LogEntries.access as any).read;
    expect(await read(customer)).toEqual({ published: { equals: true } });
    expect(await read(admin)).toBe(true);
  });
});

describe("Users role escalation", () => {
  const role = Users.fields.find((f: Field) => "name" in f && f.name === "role") as any;

  it("customer may update own user document", () => {
    expect((Users.access as any).update({ ...customer, id: 2 })).toBe(true);
  });

  it("customer cannot change the role field", async () => {
    expect(typeof role?.access?.update).toBe("function");
    expect(await role.access.update(customer)).toBe(false);
    expect(await role.access.update(anon)).toBe(false);
    expect(await role.access.update(admin)).toBe(true);
  });
});

describe("media file CSP", () => {
  it("sandboxes /api/media/file/*", () => {
    const res = middleware(new NextRequest("http://localhost:3000/api/media/file/x.png"));
    expect(res.headers.get("content-security-policy")).toBe(MEDIA_CSP);
  });

  it("keeps the nonce CSP elsewhere", () => {
    const res = middleware(new NextRequest("http://localhost:3000/projects"));
    const csp = res.headers.get("content-security-policy") ?? "";
    expect(csp).toContain("'nonce-");
    expect(csp).not.toContain("sandbox");
  });
});
