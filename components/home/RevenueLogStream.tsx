"use client";
import { useEffect, useState } from "react";
import { CmdHeader } from "../primitives/CmdHeader";
import { Cursor } from "../primitives/Cursor";
import { type Sale, formatSaleLine } from "@/lib/revenue-stream";

const MAX_LINES = 20;

export function RevenueLogStream({ initial }: { initial: Sale[] }) {
  const [lines, setLines] = useState<Sale[]>(initial);

  useEffect(() => {
    const ev = new EventSource("/api/sales-stream");
    const handler = (e: MessageEvent) => {
      try {
        const sale = JSON.parse(e.data) as Sale;
        setLines((prev) => [sale, ...prev].slice(0, MAX_LINES));
      } catch {
        /* ignore malformed payload */
      }
    };
    ev.addEventListener("sale", handler as EventListener);
    return () => {
      ev.removeEventListener("sale", handler as EventListener);
      ev.close();
    };
  }, []);

  return (
    <section style={{ padding: "56px 0 8px" }}>
      <CmdHeader cmd="tail -f ./revenue.log" />
      <div
        style={{
          fontSize: 12,
          color: "var(--dim)",
          margin: "6px 0 24px",
          paddingLeft: 18,
        }}
      >
        following… · press ^C to interrupt
      </div>
      <div style={{ border: "2px solid var(--border)", background: "var(--bg-soft)", fontSize: 13 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px 12px",
            background: "var(--fg)",
            color: "var(--bg)",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          <span>~/67projects/logs/revenue.log</span>
          <span>● live</span>
        </div>
        <div style={{ padding: 14 }}>
          {lines.map((r, i) => (
            <div
              key={`${r.time}-${i}`}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                padding: "3px 0",
                lineHeight: 1.5,
              }}
            >
              <span style={{ color: "var(--dim)", fontVariantNumeric: "tabular-nums" }}>
                [{r.time}]
              </span>
              <span style={{ color: "var(--accent)", fontWeight: 700 }}>{r.channel}:</span>
              <span>{formatSaleLine(r)}</span>
              <span style={{ marginLeft: "auto", color: "var(--dim)", fontSize: 11 }}>
                [{r.country}]
              </span>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, padding: "3px 0" }}>
            <span style={{ color: "var(--dim)" }}>[{new Date().toTimeString().slice(0, 8)}]</span>
            <span style={{ color: "var(--accent)", fontWeight: 700 }}>Stripe:</span>
            <span>Listening for events…</span>
            <Cursor char="_" />
          </div>
        </div>
      </div>
    </section>
  );
}
