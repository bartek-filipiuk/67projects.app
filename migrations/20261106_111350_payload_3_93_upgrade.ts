import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE IF EXISTS "site_settings" ALTER COLUMN "meta_description" SET DEFAULT '67 micro-products. Built with AI. One solo founder.';
  ALTER TABLE IF EXISTS "site_settings" ALTER COLUMN "hero_status_label" SET DEFAULT 'shipping';
  ALTER TABLE IF EXISTS "site_settings" ALTER COLUMN "cmd_challenge" SET DEFAULT 'cat ./the-67-bet.txt';
  ALTER TABLE IF EXISTS "site_settings" ALTER COLUMN "challenge_copy" SET DEFAULT 'One product at a time. One silent-coding video per build. 67 products total — a public bet that one solo founder + Claude Code can outship a five-person seed-stage team.';
  ALTER TABLE IF EXISTS "site_settings" ALTER COLUMN "next_ship_text" SET DEFAULT 'when it''s ready';
  ALTER TABLE IF EXISTS "users" ADD COLUMN IF NOT EXISTS "reset_password_requested_at" timestamp(3) with time zone;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE IF EXISTS "site_settings" ALTER COLUMN "meta_description" SET DEFAULT '67 micro-products in 67 days. Built with AI. One solo founder.';
  ALTER TABLE IF EXISTS "site_settings" ALTER COLUMN "hero_status_label" SET DEFAULT 'shipping daily';
  ALTER TABLE IF EXISTS "site_settings" ALTER COLUMN "cmd_challenge" SET DEFAULT 'cat ./67-days-of-ai-magic.txt';
  ALTER TABLE IF EXISTS "site_settings" ALTER COLUMN "challenge_copy" SET DEFAULT 'Every day, one new product. Every day, one silent-coding video. For 67 days. The whole thing is a public bet that one solo founder + Claude Code can outship a five-person seed-stage team.';
  ALTER TABLE IF EXISTS "site_settings" ALTER COLUMN "next_ship_text" SET DEFAULT 'tomorrow 09:00 UTC';
  ALTER TABLE IF EXISTS "users" DROP COLUMN IF EXISTS "reset_password_requested_at";`)
}
