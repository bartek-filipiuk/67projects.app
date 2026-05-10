export interface FooterLink { label: string; href: string; }
export interface FooterProps {
  cwd?: string;
  links?: FooterLink[];
  copyright?: string;
  buildTime?: string;
}

const DEFAULT_LINKS: FooterLink[] = [
  { label: "github.com/bartek-filipiuk", href: "https://github.com/bartek-filipiuk" },
  { label: "x.com/bartek67", href: "https://x.com/bartek67" },
  { label: "rss.xml", href: "/rss.xml" },
];

export function Footer({
  cwd = "/home/bartek/67projects",
  links = DEFAULT_LINKS,
  copyright = "© MMXXVI bartek",
  buildTime,
}: FooterProps) {
  // buildTime is provided by RSC parent (server-rendered once per route revalidate),
  // never rendered from `new Date()` at request time → no hydration mismatch.
  return (
    <footer style={{ marginTop: 60 }}>
      <div style={{ borderTop: "2px solid var(--border)" }} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "18px 0",
          fontSize: 12,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>{cwd}</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {links.map((l, i) => (
            <span key={l.href} style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
              <a
                href={l.href}
                rel={l.href.startsWith("http") ? "me noopener" : undefined}
                style={{ padding: "2px 6px" }}
              >
                {l.label}
              </a>
              {i < links.length - 1 && <span style={{ color: "var(--dim)" }}>|</span>}
            </span>
          ))}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: 24,
          padding: "10px 0 24px",
          fontSize: 11,
          color: "var(--dim)",
          borderTop: "1px dashed var(--border)",
          flexWrap: "wrap",
        }}
      >
        {buildTime && <span># last build: {buildTime} UTC</span>}
        <span># {copyright}</span>
      </div>
    </footer>
  );
}
