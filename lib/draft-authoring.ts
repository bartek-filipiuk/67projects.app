export const LICENSES = [
  "MIT LICENSE",
  "APACHE 2.0",
  "ISC",
  "UNLICENSE",
  "EXPERIMENTAL",
  "PROPRIETARY",
] as const;
export type License = (typeof LICENSES)[number];

/** Lower-cases, strips diacritics + punctuation, collapses to kebab-case. */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Maps a GitHub SPDX id to the Repos.license enum; unknown/none → PROPRIETARY. */
export function mapLicense(spdx: string | null | undefined): License {
  switch ((spdx ?? "").toUpperCase()) {
    case "MIT":
      return "MIT LICENSE";
    case "APACHE-2.0":
      return "APACHE 2.0";
    case "ISC":
      return "ISC";
    case "UNLICENSE":
      return "UNLICENSE";
    default:
      return "PROPRIETARY";
  }
}
