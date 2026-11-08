CREATE TABLE IF NOT EXISTS "choice_list_round" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"list_id" uuid NOT NULL,
	"round_number" integer NOT NULL,
	"title" varchar(100) NOT NULL,
	"picks" jsonb NOT NULL,
	"completed_at" timestamp with time zone NOT NULL,
	CONSTRAINT "choice_list_round_number_unique" UNIQUE("list_id","round_number"),
	CONSTRAINT "choice_list_round_number_valid" CHECK ("choice_list_round"."round_number" > 0),
	CONSTRAINT "choice_list_round_picks_array" CHECK (jsonb_typeof("choice_list_round"."picks") = 'array')
);
--> statement-breakpoint
ALTER TABLE "choice_list" ADD COLUMN IF NOT EXISTS "round_number" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "choice_list" ADD COLUMN IF NOT EXISTS "revision" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "choice_list_round" ADD CONSTRAINT "choice_list_round_list_id_choice_list_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."choice_list"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;