-- 既存のNULL値をデフォルト値に更新
UPDATE "sessions" SET "rounding_method" = 'round_half_up' WHERE "rounding_method" IS NULL;--> statement-breakpoint
UPDATE "sessions" SET "rounding_unit" = 0.1 WHERE "rounding_unit" IS NULL;--> statement-breakpoint
-- NOT NULL制約を追加
ALTER TABLE "sessions" ALTER COLUMN "rounding_method" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "rounding_method" SET DEFAULT 'round_half_up';--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "rounding_unit" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "rounding_unit" SET DEFAULT 0.1;

