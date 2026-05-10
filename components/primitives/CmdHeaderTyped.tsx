"use client";
import { useEffect, useState } from "react";
import { Cursor } from "./Cursor";

export function CmdHeaderTyped({ cmd, speed = 18 }: { cmd: string; speed?: number }) {
  const [out, setOut] = useState("");
  useEffect(() => {
    setOut("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(cmd.slice(0, i));
      if (i >= cmd.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [cmd, speed]);
  return (
    <h2
      style={{
        fontSize: 22,
        fontWeight: 700,
        margin: 0,
        letterSpacing: "-0.01em",
        display: "flex",
        alignItems: "baseline",
        flexWrap: "wrap",
      }}
    >
      <span style={{ color: "var(--accent)", marginRight: 6 }}>&gt; </span>
      <span>{out}</span>
      {out.length === cmd.length && <Cursor char="_" />}
    </h2>
  );
}
