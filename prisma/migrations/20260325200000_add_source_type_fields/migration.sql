-- AlterTable
ALTER TABLE "Source" ADD COLUMN "sourceType" TEXT NOT NULL DEFAULT 'rss';
ALTER TABLE "Source" ADD COLUMN "sitemapPathPattern" TEXT;
ALTER TABLE "Source" ADD COLUMN "scrapeUrl" TEXT;
ALTER TABLE "Source" ADD COLUMN "scrapeLinkSelector" TEXT;
