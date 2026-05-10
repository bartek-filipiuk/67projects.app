import Link from "next/link";
import { Cursor } from "../primitives/Cursor";
import { NavLink } from "./NavLink";

export function Nav({ siteName = "bartek@67projects" }: { siteName?: string }) {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 0",
        borderBottom: "2px solid var(--border)",
        fontSize: 14,
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <Link
        href="/"
        aria-label="home"
        style={{
          display: "inline-flex",
          alignItems: "center",
          fontWeight: 700,
          fontSize: 16,
          letterSpacing: "-0.005em",
        }}
      >
        <span>{siteName}</span>
        <span style={{ color: "var(--accent)" }}>:</span>
        <span style={{ color: "var(--accent)" }}>~</span>
        <span>$</span>
        <Cursor char="_" />
      </Link>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        <NavLink href="/projects">/projects</NavLink>
        <NavLink href="/open-source">/open-source</NavLink>
        <NavLink href="/log">/log</NavLink>
        <NavLink href="/contact">/contact</NavLink>
      </div>
    </nav>
  );
}
