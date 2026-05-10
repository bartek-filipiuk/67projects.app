import { z } from "zod";

// eslint-disable-next-line security/detect-unsafe-regex -- bounded character class, no catastrophic backtracking
const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

export const slugSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(SLUG_RE, "slug must be kebab-case alphanumeric");

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(80),
  message: z.string().trim().min(10).max(2000),
  honeypot: z.string().max(0, "spam detected").optional().default(""),
});

export const githubRepoSchema = z.object({
  owner: z.string().regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38})$/, "invalid owner"),
  repo: z.string().regex(/^[a-zA-Z0-9_.-]{1,100}$/, "invalid repo"),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type GithubRepoInput = z.infer<typeof githubRepoSchema>;
