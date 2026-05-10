import { Cursor } from "../primitives/Cursor";
import { NavLink } from "./NavLink";

export function Nav() {
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
      <div style={{ display: "inline-flex", alignItems: "center", fontWeight: 600 }}>
        <span>bartek@67projects</span>
        <span style={{ color: "var(--accent)" }}>:</span>
        <span style={{ color: "var(--accent)" }}>~</span>
        <span>$</span>
        <Cursor char="_" />
      </div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        <NavLink href="/projects">/projects</NavLink>
        <NavLink href="/open-source">/open-source</NavLink>
        <NavLink href="/log">/log</NavLink>
        <NavLink href="/contact">/contact</NavLink>
      </div>
    </nav>
  );
}
