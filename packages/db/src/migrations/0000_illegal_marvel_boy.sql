CREATE TABLE "api_token" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"token_hash" text NOT NULL,
	"token_prefix" text NOT NULL,
	"permissions" text[],
	"last_used_at" timestamp,
	"last_used_ip" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_word" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"term" text NOT NULL,
	"word_index" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "daily_word_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "user_daily_word" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"daily_word_id" uuid NOT NULL,
	"word_id" uuid,
	"skipped" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_daily_word_unique" UNIQUE("user_id","daily_word_id")
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"color" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "word" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"term" text NOT NULL,
	"category_id" uuid,
	"meaning" text,
	"part_of_speech" text,
	"pronunciation" text,
	"memorable_explanation" text,
	"hindi_translation" text,
	"hindi_context" text,
	"etymology" text,
	"usage_examples" jsonb DEFAULT '[]'::jsonb,
	"synonyms" jsonb DEFAULT '[]'::jsonb,
	"antonyms" jsonb DEFAULT '[]'::jsonb,
	"collocations" jsonb DEFAULT '[]'::jsonb,
	"topics" jsonb DEFAULT '[]'::jsonb,
	"difficulty" text,
	"notes" text,
	"context" text,
	"ai_generated" boolean DEFAULT false,
	"ai_provider" text,
	"ai_status" text DEFAULT 'idle',
	"ai_error" text,
	"source" text DEFAULT 'web',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "word_relationship" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"source_word_id" uuid NOT NULL,
	"target_word_id" uuid NOT NULL,
	"relation_type" text NOT NULL,
	"strength" text DEFAULT '0.5',
	"explanation" text,
	"source" text DEFAULT 'ai',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "word_tag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"word_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"ai_provider" text DEFAULT 'openai',
	"ai_api_key" text,
	"ai_model" text,
	"theme" text DEFAULT 'system',
	"default_language" text DEFAULT 'en',
	"preferences" jsonb,
	"is_onboarded" boolean DEFAULT false NOT NULL,
	"onboarding_step" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "library_word" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"term" text NOT NULL,
	"slug" text NOT NULL,
	"meaning" text,
	"part_of_speech" text,
	"pronunciation" text,
	"memorable_explanation" text,
	"hindi_translation" text,
	"hindi_context" text,
	"etymology" text,
	"usage_examples" jsonb DEFAULT '[]'::jsonb,
	"synonyms" jsonb DEFAULT '[]'::jsonb,
	"antonyms" jsonb DEFAULT '[]'::jsonb,
	"collocations" jsonb DEFAULT '[]'::jsonb,
	"topics" jsonb DEFAULT '[]'::jsonb,
	"difficulty" text,
	"category" text,
	"published_at" date NOT NULL,
	"ai_generated" boolean DEFAULT false,
	"ai_provider" text,
	"ai_status" text DEFAULT 'idle',
	"ai_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "library_word_term_unique" UNIQUE("term"),
	CONSTRAINT "library_word_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "api_token" ADD CONSTRAINT "api_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_daily_word" ADD CONSTRAINT "user_daily_word_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_daily_word" ADD CONSTRAINT "user_daily_word_daily_word_id_daily_word_id_fk" FOREIGN KEY ("daily_word_id") REFERENCES "public"."daily_word"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_daily_word" ADD CONSTRAINT "user_daily_word_word_id_word_id_fk" FOREIGN KEY ("word_id") REFERENCES "public"."word"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tag" ADD CONSTRAINT "tag_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "word" ADD CONSTRAINT "word_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "word" ADD CONSTRAINT "word_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "word_relationship" ADD CONSTRAINT "word_relationship_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "word_relationship" ADD CONSTRAINT "word_relationship_source_word_id_word_id_fk" FOREIGN KEY ("source_word_id") REFERENCES "public"."word"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "word_relationship" ADD CONSTRAINT "word_relationship_target_word_id_word_id_fk" FOREIGN KEY ("target_word_id") REFERENCES "public"."word"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "word_tag" ADD CONSTRAINT "word_tag_word_id_word_id_fk" FOREIGN KEY ("word_id") REFERENCES "public"."word"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "word_tag" ADD CONSTRAINT "word_tag_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "api_token_user_idx" ON "api_token" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "api_token_hash_idx" ON "api_token" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "api_token_active_idx" ON "api_token" USING btree ("user_id","is_active");--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "daily_word_date_idx" ON "daily_word" USING btree ("date");--> statement-breakpoint
CREATE INDEX "user_daily_word_user_idx" ON "user_daily_word" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_daily_word_daily_idx" ON "user_daily_word" USING btree ("daily_word_id");--> statement-breakpoint
CREATE INDEX "category_user_idx" ON "category" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "category_name_idx" ON "category" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "tag_user_idx" ON "tag" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tag_name_idx" ON "tag" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "word_user_idx" ON "word" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "word_term_idx" ON "word" USING btree ("user_id","term");--> statement-breakpoint
CREATE INDEX "word_category_idx" ON "word" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "word_created_idx" ON "word" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "word_rel_source_idx" ON "word_relationship" USING btree ("source_word_id");--> statement-breakpoint
CREATE INDEX "word_rel_target_idx" ON "word_relationship" USING btree ("target_word_id");--> statement-breakpoint
CREATE INDEX "word_rel_user_idx" ON "word_relationship" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "word_tag_word_idx" ON "word_tag" USING btree ("word_id");--> statement-breakpoint
CREATE INDEX "word_tag_tag_idx" ON "word_tag" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "library_word_slug_idx" ON "library_word" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "library_word_published_idx" ON "library_word" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "library_word_term_idx" ON "library_word" USING btree ("term");