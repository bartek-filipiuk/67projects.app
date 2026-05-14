import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PAYLOAD_SECRET: z.string().min(32, "PAYLOAD_SECRET must be at least 32 chars"),
  DATABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SERVER_URL: z.string().url(),
  GITHUB_TOKEN: z.string().optional(),
  DAILY_SALT_SECRET: z.string().min(16),
  TRUST_PROXY: z
    .string()
    .transform((v) => v === "1" || v.toLowerCase() === "true")
    .default("0"),
  NEXT_PUBLIC_UMAMI_SRC: z.string().url().optional(),
  NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().uuid().optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n");
  throw new Error(`Invalid environment variables:\n${issues}`);
}

export const env = parsed.data;
