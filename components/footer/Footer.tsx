export function Footer() {
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
        <div>/home/bartek/67projects</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <a href="https://github.com/bartek-filipiuk" rel="me noopener" style={{ padding: "2px 6px" }}>
            github.com/bartek-filipiuk
          </a>
          <span style={{ color: "var(--dim)" }}>|</span>
          <a href="https://x.com/bartek67" rel="me noopener" style={{ padding: "2px 6px" }}>
            x.com/bartek67
          </a>
          <span style={{ color: "var(--dim)" }}>|</span>
          <a href="/rss.xml" style={{ padding: "2px 6px" }}>
            rss.xml
          </a>
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
        <span># last build: {new Date().toISOString().slice(0, 19).replace("T", " ")} UTC</span>
        <span># © MMXXVI bartek</span>
      </div>
    </footer>
  );
}
