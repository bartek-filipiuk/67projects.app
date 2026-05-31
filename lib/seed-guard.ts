/**
 * Decides whether the fresh-start seed should write default SiteSettings.
 *
 * Payload returns `{}` (no `updatedAt`) for a global that has never been
 * persisted; a saved global — whether saved by a prior seed run or by an admin
 * edit in `/admin` — carries an `updatedAt` timestamp. We initialize defaults
 * ONLY on the very first run, so that redeploys never clobber admin edits.
 *
 * The previous heuristic keyed off `totalRevenueCents === 0`, which stays true
 * until Stripe is wired — so it re-seeded (and overwrote admin edits) on every
 * deploy. Keying off persistence (`updatedAt`) fixes that at the root.
 */
export function shouldInitializeSiteSettings(
  current: { updatedAt?: unknown } | null | undefined,
): boolean {
  return !current?.updatedAt;
}
