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

export type LexicalTextNode = {
  type: "text";
  text: string;
  format: number;
  style: string;
  mode: "normal";
  detail: number;
  version: number;
};

export type LexicalParagraphNode = {
  type: "paragraph";
  format: "";
  indent: number;
  version: number;
  direction: "ltr";
  textFormat: number;
  children: LexicalTextNode[];
};

export type LexicalState = {
  root: {
    type: "root";
    format: "";
    indent: number;
    version: number;
    direction: "ltr";
    children: LexicalParagraphNode[];
  };
};

function paragraph(text: string): LexicalParagraphNode {
  const children: LexicalTextNode[] =
    text.length === 0
      ? []
      : [{ type: "text", text, format: 0, style: "", mode: "normal", detail: 0, version: 1 }];
  return { type: "paragraph", format: "", indent: 0, version: 1, direction: "ltr", textFormat: 0, children };
}

/** Serializes plain-text lines into a minimal valid Lexical editor state. */
export function buildLexical(lines: string[]): LexicalState {
  const paras = lines.filter((l) => l.trim().length > 0).map(paragraph);
  const children = paras.length > 0 ? paras : [paragraph("")];
  return { root: { type: "root", format: "", indent: 0, version: 1, direction: "ltr", children } };
}
