ALTER TABLE "problem_option" DROP CONSTRAINT "problem_option_selection_valid";--> statement-breakpoint
DROP INDEX "problem_option_one_selected_idx";--> statement-breakpoint
-- Existing problems have only one chosen option: it was the first pick.
UPDATE "problem_option" SET "selected_order" = 1 WHERE "is_selected" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "problem_option_selected_order_unique" ON "problem_option" USING btree ("problem_id","selected_order") WHERE "problem_option"."selected_order" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "problem_option" ADD CONSTRAINT "problem_option_selection_valid" CHECK (("problem_option"."is_selected" = true AND "problem_option"."selected_order" IS NOT NULL AND "problem_option"."selected_order" between 1 and 10) OR ("problem_option"."is_selected" = false AND "problem_option"."selected_order" IS NULL));