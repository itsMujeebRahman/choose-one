ALTER TABLE "problem_option" ADD COLUMN "selected_order" integer;
--> statement-breakpoint
UPDATE "problem_option" AS o
SET "is_selected" = true,
    "selected_order" = o."sort_order",
    "metadata" = o."metadata" || jsonb_build_object('selection', jsonb_build_object(
      'algorithm', r."algorithm", 'chosenAt', r."created_at",
      'chosenLabel', r."option_label", 'metadata', r."metadata"
    ))
FROM "result" AS r
WHERE r."option_id" = o."id" AND r."problem_id" = o."problem_id" AND r."user_id" = o."user_id";
--> statement-breakpoint
UPDATE "problem_option" SET "selected_order" = "sort_order" WHERE "is_selected" = true AND "selected_order" IS NULL;
--> statement-breakpoint
DROP TABLE "result";
--> statement-breakpoint
ALTER TABLE "problem_option" DROP CONSTRAINT "problem_option_identity_unique";
--> statement-breakpoint
ALTER TABLE "problem_option" ADD CONSTRAINT "problem_option_selection_valid" CHECK (
  ("is_selected" = true AND "selected_order" IS NOT NULL AND "selected_order" = "sort_order")
  OR ("is_selected" = false AND "selected_order" IS NULL)
);
