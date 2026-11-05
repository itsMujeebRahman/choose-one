CREATE TABLE "choice_list" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" varchar(100) NOT NULL,
	"pick_count" integer DEFAULT 0 NOT NULL,
	"option_count" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "choice_list_counts_valid" CHECK ("choice_list"."option_count" between 10 and 20 AND "choice_list"."pick_count" between 0 and "choice_list"."option_count"),
	CONSTRAINT "choice_list_title_valid" CHECK (length(trim("choice_list"."title")) > 0)
);
--> statement-breakpoint
CREATE TABLE "choice_list_option" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"list_id" uuid NOT NULL,
	"label" varchar(120) NOT NULL,
	"sort_order" integer NOT NULL,
	"selected_order" integer,
	"selected_at" timestamp with time zone,
	"pick_request_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "choice_list_option_sort_unique" UNIQUE("list_id","sort_order"),
	CONSTRAINT "choice_list_option_pick_unique" UNIQUE("list_id","selected_order"),
	CONSTRAINT "choice_list_option_request_unique" UNIQUE("list_id","pick_request_id"),
	CONSTRAINT "choice_list_option_order_valid" CHECK ("choice_list_option"."sort_order" between 1 and 20),
	CONSTRAINT "choice_list_option_label_valid" CHECK (length(trim("choice_list_option"."label")) > 0),
	CONSTRAINT "choice_list_option_selection_valid" CHECK (("choice_list_option"."selected_order" IS NULL AND "choice_list_option"."selected_at" IS NULL AND "choice_list_option"."pick_request_id" IS NULL) OR ("choice_list_option"."selected_order" between 1 and 20 AND "choice_list_option"."selected_at" IS NOT NULL AND "choice_list_option"."pick_request_id" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "choice_list" ADD CONSTRAINT "choice_list_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "choice_list_option" ADD CONSTRAINT "choice_list_option_list_id_choice_list_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."choice_list"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "choice_list_owner_idx" ON "choice_list" USING btree ("user_id","created_at");