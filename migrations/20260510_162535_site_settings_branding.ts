import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_settings_footer_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_contact_fields" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  ALTER TABLE "site_settings" ADD COLUMN "site_name" varchar DEFAULT 'bartek@67projects' NOT NULL;
  ALTER TABLE "site_settings" ADD COLUMN "meta_title" varchar DEFAULT '67 Projects · bartek@67projects:~$';
  ALTER TABLE "site_settings" ADD COLUMN "meta_description" varchar DEFAULT '67 micro-products in 67 days. Built with AI. One solo founder.';
  ALTER TABLE "site_settings" ADD COLUMN "boot_text" varchar DEFAULT 'Loading 67projects.app v0.1.0… OK.';
  ALTER TABLE "site_settings" ADD COLUMN "hero_title" varchar DEFAULT '67 Projects.
  Built with AI.' NOT NULL;
  ALTER TABLE "site_settings" ADD COLUMN "hero_subtitle" varchar DEFAULT 'One solo founder. Zero lines of code typed.
  67 micro-products for developers and creators. One at a time. No subscriptions.';
  ALTER TABLE "site_settings" ADD COLUMN "hero_status_label" varchar DEFAULT 'shipping daily';
  ALTER TABLE "site_settings" ADD COLUMN "hero_mrr_label" varchar DEFAULT '$0 (one-time only)';
  ALTER TABLE "site_settings" ADD COLUMN "hero_primary_cta_label" varchar DEFAULT '> BROWSE ALL PROJECTS';
  ALTER TABLE "site_settings" ADD COLUMN "hero_primary_cta_href" varchar DEFAULT '/projects';
  ALTER TABLE "site_settings" ADD COLUMN "hero_secondary_cta_label" varchar DEFAULT '> READ THE LOG';
  ALTER TABLE "site_settings" ADD COLUMN "hero_secondary_cta_href" varchar DEFAULT '/log';
  ALTER TABLE "site_settings" ADD COLUMN "cmd_latest_releases" varchar DEFAULT 'ls -la ./latest-releases';
  ALTER TABLE "site_settings" ADD COLUMN "cmd_open_source" varchar DEFAULT 'cat ./open-source.md';
  ALTER TABLE "site_settings" ADD COLUMN "cmd_revenue_log" varchar DEFAULT 'tail -f ./revenue.log';
  ALTER TABLE "site_settings" ADD COLUMN "cmd_challenge" varchar DEFAULT 'cat ./67-days-of-ai-magic.txt';
  ALTER TABLE "site_settings" ADD COLUMN "challenge_copy" varchar DEFAULT 'Every day, one new product. Every day, one silent-coding video. For 67 days. The whole thing is a public bet that one solo founder + Claude Code can outship a five-person seed-stage team.';
  ALTER TABLE "site_settings" ADD COLUMN "next_ship_text" varchar DEFAULT 'tomorrow 09:00 UTC';
  ALTER TABLE "site_settings" ADD COLUMN "footer_cwd" varchar DEFAULT '/home/bartek/67projects';
  ALTER TABLE "site_settings" ADD COLUMN "footer_copyright" varchar DEFAULT '© MMXXVI bartek';
  ALTER TABLE "site_settings_footer_links" ADD CONSTRAINT "site_settings_footer_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_contact_fields" ADD CONSTRAINT "site_settings_contact_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_footer_links_order_idx" ON "site_settings_footer_links" USING btree ("_order");
  CREATE INDEX "site_settings_footer_links_parent_id_idx" ON "site_settings_footer_links" USING btree ("_parent_id");
  CREATE INDEX "site_settings_contact_fields_order_idx" ON "site_settings_contact_fields" USING btree ("_order");
  CREATE INDEX "site_settings_contact_fields_parent_id_idx" ON "site_settings_contact_fields" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_settings_footer_links" CASCADE;
  DROP TABLE "site_settings_contact_fields" CASCADE;
  ALTER TABLE "site_settings" DROP COLUMN "site_name";
  ALTER TABLE "site_settings" DROP COLUMN "meta_title";
  ALTER TABLE "site_settings" DROP COLUMN "meta_description";
  ALTER TABLE "site_settings" DROP COLUMN "boot_text";
  ALTER TABLE "site_settings" DROP COLUMN "hero_title";
  ALTER TABLE "site_settings" DROP COLUMN "hero_subtitle";
  ALTER TABLE "site_settings" DROP COLUMN "hero_status_label";
  ALTER TABLE "site_settings" DROP COLUMN "hero_mrr_label";
  ALTER TABLE "site_settings" DROP COLUMN "hero_primary_cta_label";
  ALTER TABLE "site_settings" DROP COLUMN "hero_primary_cta_href";
  ALTER TABLE "site_settings" DROP COLUMN "hero_secondary_cta_label";
  ALTER TABLE "site_settings" DROP COLUMN "hero_secondary_cta_href";
  ALTER TABLE "site_settings" DROP COLUMN "cmd_latest_releases";
  ALTER TABLE "site_settings" DROP COLUMN "cmd_open_source";
  ALTER TABLE "site_settings" DROP COLUMN "cmd_revenue_log";
  ALTER TABLE "site_settings" DROP COLUMN "cmd_challenge";
  ALTER TABLE "site_settings" DROP COLUMN "challenge_copy";
  ALTER TABLE "site_settings" DROP COLUMN "next_ship_text";
  ALTER TABLE "site_settings" DROP COLUMN "footer_cwd";
  ALTER TABLE "site_settings" DROP COLUMN "footer_copyright";`)
}
