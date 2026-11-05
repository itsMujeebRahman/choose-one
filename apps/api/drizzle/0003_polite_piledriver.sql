ALTER TABLE "problem_option" ADD CONSTRAINT "problem_option_identity_unique" UNIQUE("id","problem_id","user_id");
--> statement-breakpoint
CREATE TABLE "result" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"problem_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"option_id" uuid NOT NULL,
	"option_label" varchar(120) NOT NULL,
	"option_order" integer NOT NULL,
	"algorithm" text DEFAULT 'crypto_uniform_v1' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "result_problem_unique" UNIQUE("problem_id"),
	CONSTRAINT "result_option_order_valid" CHECK ("result"."option_order" between 1 and 10),
	CONSTRAINT "result_label_not_blank" CHECK (length(trim("result"."option_label")) > 0),
	CONSTRAINT "result_metadata_object" CHECK (jsonb_typeof("result"."metadata") = 'object')
);
--> statement-breakpoint
ALTER TABLE "result" ADD CONSTRAINT "result_problem_owner_fk" FOREIGN KEY ("problem_id","user_id") REFERENCES "public"."problem"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "result" ADD CONSTRAINT "result_option_owner_fk" FOREIGN KEY ("option_id","problem_id","user_id") REFERENCES "public"."problem_option"("id","problem_id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "result_user_created_idx" ON "result" USING btree ("user_id","created_at");