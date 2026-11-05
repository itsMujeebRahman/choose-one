CREATE TABLE "problem" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"chosen_at" timestamp with time zone,
	CONSTRAINT "problem_id_user_id_unique" UNIQUE("id","user_id"),
	CONSTRAINT "problem_title_not_blank" CHECK (length(trim("problem"."title")) > 0),
	CONSTRAINT "problem_status_valid" CHECK ("problem"."status" in ('draft', 'chosen', 'archived')),
	CONSTRAINT "problem_metadata_object" CHECK (jsonb_typeof("problem"."metadata") = 'object')
);
--> statement-breakpoint
CREATE TABLE "problem_option" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"problem_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"label" varchar(120) NOT NULL,
	"sort_order" integer NOT NULL,
	"is_selected" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "problem_option_order_unique" UNIQUE("problem_id","sort_order"),
	CONSTRAINT "problem_option_order_valid" CHECK ("problem_option"."sort_order" between 1 and 10),
	CONSTRAINT "problem_option_label_not_blank" CHECK (length(trim("problem_option"."label")) > 0),
	CONSTRAINT "problem_option_metadata_object" CHECK (jsonb_typeof("problem_option"."metadata") = 'object')
);
--> statement-breakpoint
ALTER TABLE "problem" ADD CONSTRAINT "problem_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_option" ADD CONSTRAINT "problem_option_owner_fk" FOREIGN KEY ("problem_id","user_id") REFERENCES "public"."problem"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "problem_user_created_idx" ON "problem" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "problem_option_one_selected_idx" ON "problem_option" USING btree ("problem_id") WHERE "problem_option"."is_selected" = true;--> statement-breakpoint
CREATE INDEX "problem_option_user_idx" ON "problem_option" USING btree ("user_id");