-- AlterTable
ALTER TABLE "Article" ADD COLUMN "approvedAt" TIMESTAMP(3);

-- Backfill: all already-enriched articles are auto-approved
UPDATE "Article" SET "approvedAt" = "enrichedAt" WHERE "enrichedAt" IS NOT NULL;
