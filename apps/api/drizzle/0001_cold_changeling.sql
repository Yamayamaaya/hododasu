-- Step 1: Add column as nullable first
ALTER TABLE "sessions" ADD COLUMN "result_id" text;--> statement-breakpoint
-- Step 2: Generate result_id for existing records
UPDATE "sessions" SET "result_id" = gen_random_uuid()::text WHERE "result_id" IS NULL;--> statement-breakpoint
-- Step 3: Add NOT NULL constraint
ALTER TABLE "sessions" ALTER COLUMN "result_id" SET NOT NULL;--> statement-breakpoint
-- Step 4: Add UNIQUE constraint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_result_id_unique" UNIQUE("result_id");