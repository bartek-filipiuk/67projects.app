import type { Metadata } from "next";
import "../globals.css";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/footer/Footer";

export const metadata: Metadata = {
  title: "67 Projects · bartek@67projects:~$",
  description: "67 micro-products in 67 days. Built with AI. One solo founder.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ minHeight: "100vh", maxWidth: 1440, margin: "0 auto", padding: "0 32px", borderLeft: "1px dashed var(--dim)", borderRight: "1px dashed var(--dim)" }}>
          <div style={{ display: "flex", gap: 24, fontSize: 11, padding: "6px 0 4px", borderBottom: "1px dashed var(--dim)", color: "var(--dim)" }}>
            <span>Loading 67projects.app v0.1.0…</span>
            <span>OK.</span>
          </div>
          <Nav />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
