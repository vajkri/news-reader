-- DropIndex (replaced by unique constraint)
DROP INDEX "RateLimit_key_idx";

-- Delete duplicate keys keeping only the latest window per key
DELETE FROM "RateLimit" a
USING "RateLimit" b
WHERE a.id < b.id AND a.key = b.key;

-- CreateIndex (unique constraint replaces the old index)
CREATE UNIQUE INDEX "RateLimit_key_key" ON "RateLimit"("key");
