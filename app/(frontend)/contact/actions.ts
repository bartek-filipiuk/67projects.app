"use server";
import { headers } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import { contactSchema } from "@/lib/validators";
import { contactLimiter } from "@/lib/rate-limit";
import { getClientIp, hashIp } from "@/lib/ip";
import { env } from "@/lib/env";

export interface SubmitResult {
  ok: boolean;
  error?: string;
}

export async function submitContact(
  _prev: SubmitResult | null,
  formData: FormData,
): Promise<SubmitResult> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    message: formData.get("message"),
    honeypot: formData.get("website") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "invalid input" };
  }

  const h = await headers();
  const ip = getClientIp(h, env.TRUST_PROXY);
  const limit = contactLimiter.take(ip);
  if (!limit.ok) return { ok: false, error: "rate limit exceeded — try again later" };

  const payload = await getPayload({ config });
  await payload.create({
    collection: "contactSubmissions",
    data: {
      name: parsed.data.name,
      message: parsed.data.message,
      ipHash: hashIp(ip),
      userAgent: (h.get("user-agent") ?? "").slice(0, 500),
    },
  });
  return { ok: true };
}
