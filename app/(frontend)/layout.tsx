import type { Metadata } from "next";
import Script from "next/script";
import { headers } from "next/headers";
import "../globals.css";
import { jetbrainsMono } from "@/styles/fonts";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/footer/Footer";
import { getSiteSettings } from "@/lib/site-settings";
import { env } from "@/lib/env";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    title: s.metaTitle,
    description: s.metaDescription,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000"),
  };
}

// Stable build timestamp captured at module load (build time / cold start),
// not request time → no hydration mismatch.
const BUILD_TIME = new Date().toISOString().slice(0, 19).replace("T", " ");

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSiteSettings();
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const umamiEnabled =
    env.NODE_ENV === "production" && !!env.NEXT_PUBLIC_UMAMI_SRC && !!env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <body>
        {umamiEnabled && (
          <Script
            src={env.NEXT_PUBLIC_UMAMI_SRC!}
            data-website-id={env.NEXT_PUBLIC_UMAMI_WEBSITE_ID!}
            data-do-not-track="true"
            strategy="afterInteractive"
            nonce={nonce}
          />
        )}
        <div
          style={{
            minHeight: "100vh",
            maxWidth: 1440,
            margin: "0 auto",
            padding: "0 32px",
            borderLeft: "1px dashed var(--dim)",
            borderRight: "1px dashed var(--dim)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 24,
              fontSize: 11,
              padding: "6px 0 4px",
              borderBottom: "1px dashed var(--dim)",
              color: "var(--dim)",
            }}
          >
            <span>{s.bootText}</span>
          </div>
          <Nav siteName={s.siteName} />
          {children}
          <Footer
            cwd={s.footerCwd}
            links={s.footerLinks}
            copyright={s.footerCopyright}
            buildTime={BUILD_TIME}
          />
        </div>
      </body>
    </html>
  );
}
