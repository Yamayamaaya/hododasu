-- Step 1: Update NULL titles to a default value
UPDATE "sessions" SET "title" = '無題のセッション' WHERE "title" IS NULL;--> statement-breakpoint
-- Step 2: Add NOT NULL constraint
ALTER TABLE "sessions" ALTER COLUMN "title" SET NOT NULL;