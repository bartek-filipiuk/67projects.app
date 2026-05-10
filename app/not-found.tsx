import Link from "next/link";
import { CmdHeader } from "@/components/primitives/CmdHeader";

export default function NotFound() {
  return (
    <main style={{ padding: "56px 32px 80px", maxWidth: 1440, margin: "0 auto" }}>
      <CmdHeader cmd="stat $REQUESTED_PATH" />
      <div
        style={{
          border: "2px solid var(--border)",
          background: "var(--bg-soft)",
          padding: 14,
          marginTop: 16,
        }}
      >
        <div># stat: cannot stat: No such file or directory</div>
        <div># exit 2</div>
      </div>
      <Link
        href="/"
        style={{ borderBottom: "1px solid var(--fg)", marginTop: 16, display: "inline-block" }}
      >
        → cd ~
      </Link>
    </main>
  );
}
