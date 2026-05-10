import localFont from "next/font/local";

export const jetbrainsMono = localFont({
  src: [
    { path: "../public/fonts/JetBrainsMono-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/JetBrainsMono-Bold.woff2", weight: "700", style: "normal" },
    { path: "../public/fonts/JetBrainsMono-ExtraBold.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-jetbrains-mono",
  display: "swap",
  fallback: ["ui-monospace", "Menlo", "monospace"],
  preload: true,
});
