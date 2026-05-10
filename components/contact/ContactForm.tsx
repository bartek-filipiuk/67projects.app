"use client";
import { useActionState } from "react";
import { submitContact, type SubmitResult } from "@/app/(frontend)/contact/actions";

export function ContactForm() {
  const [state, action, pending] = useActionState<SubmitResult | null, FormData>(submitContact, null);
  return (
    <form
      action={action}
      style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 640 }}
    >
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
        <span style={{ color: "var(--dim)" }}>$ NAME=</span>
        <input
          name="name"
          required
          maxLength={80}
          className="form-input"
          placeholder="ada lovelace"
          autoComplete="name"
        />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
        <span style={{ color: "var(--dim)" }}>$ cat &gt; message.txt &lt;&lt;EOF</span>
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          className="form-input"
          placeholder="i want to commission a custom mini-saas..."
        />
        <span style={{ color: "var(--dim)" }}>$ EOF</span>
      </label>
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: -9999, opacity: 0, height: 0, width: 0 }}
      />
      <button type="submit" disabled={pending} className="btn-brutal btn-primary">
        {pending ? "> SENDING…" : "> SEND MESSAGE"}
      </button>
      {state?.ok && (
        <div
          style={{
            border: "2px solid var(--border)",
            padding: "12px 14px",
            fontSize: 13,
            background: "var(--bg-soft)",
          }}
        >
          <div># queued. expect a reply within 24h.</div>
        </div>
      )}
      {state && !state.ok && (
        <div
          role="alert"
          style={{
            border: "2px solid var(--warn)",
            padding: "12px 14px",
            fontSize: 13,
            color: "var(--warn)",
          }}
        >
          # error: {state.error}
        </div>
      )}
    </form>
  );
}
