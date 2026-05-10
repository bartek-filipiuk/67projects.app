#!/bin/sh
set -e

# Wait for Postgres (Coolify provides DATABASE_URL pointing to internal hostname).
echo "[entrypoint] waiting for database..."
node - <<'EOF'
const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL not set"); process.exit(1); }
const m = url.match(/^postgres(?:ql)?:\/\/[^@]+@([^:/?]+)(?::(\d+))?/);
if (!m) { console.error("DATABASE_URL malformed"); process.exit(1); }
const host = m[1]; const port = parseInt(m[2] || "5432", 10);
const net = require("net");
const start = Date.now();
const TIMEOUT_MS = 60_000;
function tryOnce() {
  return new Promise((resolve) => {
    const s = net.connect({ host, port, timeout: 2000 }, () => { s.end(); resolve(true); });
    s.on("error", () => resolve(false));
    s.on("timeout", () => { s.destroy(); resolve(false); });
  });
}
(async () => {
  while (Date.now() - start < TIMEOUT_MS) {
    if (await tryOnce()) { console.log("[entrypoint] db reachable at " + host + ":" + port); return; }
    await new Promise((r) => setTimeout(r, 1500));
  }
  console.error("[entrypoint] db unreachable after " + (TIMEOUT_MS / 1000) + "s");
  process.exit(1);
})();
EOF

# Apply Payload migrations (idempotent — Payload tracks applied migrations in DB).
echo "[entrypoint] running payload migrations..."
node node_modules/payload/dist/bin/index.js migrate

# Idempotent fresh-start seed (categories + clean SiteSettings on first run).
if [ "${RUN_SEED_FRESH:-1}" = "1" ]; then
  echo "[entrypoint] running seed-fresh..."
  ./node_modules/.bin/tsx scripts/seed-fresh.ts || echo "[entrypoint] seed-fresh skipped/failed (non-fatal)"
fi

# Idempotent admin user creation (uses ADMIN_EMAIL + ADMIN_PASSWORD env vars).
if [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PASSWORD" ]; then
  echo "[entrypoint] ensuring admin user..."
  ./node_modules/.bin/tsx scripts/create-admin.ts || echo "[entrypoint] admin already exists or skip"
fi

echo "[entrypoint] starting next.js..."
exec node server.js
