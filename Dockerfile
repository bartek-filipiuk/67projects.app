# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS=--max-old-space-size=3072

# Build-time args. Coolify overrides NEXT_PUBLIC_SERVER_URL via build args
# (it gets baked into the client bundle). The other secrets are placeholders
# only — env validation passes during build, real values are injected at
# runtime from Coolify env vars.
ARG NEXT_PUBLIC_SERVER_URL=https://67projects.app
ARG PAYLOAD_SECRET=build-time-placeholder-32-bytes-aaaaaaaa
ARG DATABASE_URL=postgres://x:x@127.0.0.1:5432/x
ARG DAILY_SALT_SECRET=build-time-placeholder-salt-32-bytes-bb
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL
ENV PAYLOAD_SECRET=$PAYLOAD_SECRET
ENV DATABASE_URL=$DATABASE_URL
ENV DAILY_SALT_SECRET=$DAILY_SALT_SECRET
ENV NODE_ENV=production

RUN pnpm build

FROM node:22-alpine AS prod-deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --prod

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache curl && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Production-only node_modules (overrides standalone's traced node_modules
# with full prod set so tsx + payload bin work for entrypoint scripts).
COPY --from=prod-deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Source files needed by entrypoint scripts at runtime.
COPY --chown=nextjs:nodejs payload.config.ts ./payload.config.ts
COPY --chown=nextjs:nodejs collections ./collections
COPY --chown=nextjs:nodejs globals ./globals
COPY --chown=nextjs:nodejs lib ./lib
COPY --chown=nextjs:nodejs scripts ./scripts
COPY --chown=nextjs:nodejs migrations ./migrations
COPY --chown=nextjs:nodejs tsconfig.json ./tsconfig.json
COPY --chown=nextjs:nodejs package.json ./package.json

RUN mkdir -p /app/media && chown nextjs:nodejs /app/media

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -fsS http://localhost:3000/api/health || exit 1

ENTRYPOINT ["/bin/sh", "/app/scripts/entrypoint.sh"]
