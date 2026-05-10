"use client";

export default function ErrorBoundary({ reset }: { error: Error; reset: () => void }) {
  return (
    <main style={{ padding: "56px 32px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>&gt; segfault (core dumped)</h1>
      <p style={{ fontSize: 13, color: "var(--dim)", margin: "8px 0 16px" }}>
        # something crashed. logs were captured. try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="btn-brutal btn-primary"
        style={{ marginTop: 16 }}
      >
        &gt; RETRY
      </button>
    </main>
  );
}
