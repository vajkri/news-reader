-- AlterTable
ALTER TABLE "Article" ADD COLUMN "enrichedAt" DATETIME;
ALTER TABLE "Article" ADD COLUMN "importanceScore" INTEGER;
ALTER TABLE "Article" ADD COLUMN "summary" TEXT;
ALTER TABLE "Article" ADD COLUMN "topics" TEXT;

-- CreateIndex
CREATE INDEX "Article_enrichedAt_idx" ON "Article"("enrichedAt");
