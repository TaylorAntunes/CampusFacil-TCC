ALTER TABLE "users" ADD COLUMN "email_verified_at" TIMESTAMP(3), ADD COLUMN "verification_token_hash" TEXT, ADD COLUMN "verification_expires_at" TIMESTAMP(3);
CREATE UNIQUE INDEX "users_verification_token_hash_key" ON "users"("verification_token_hash");
CREATE TABLE "sessions" ("id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL, "revokedAt" TIMESTAMP(3));
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- NOT VALID preserves historical records; new writes are constrained immediately.
ALTER TABLE "advertisements" ADD CONSTRAINT "advertisements_price_nonnegative" CHECK ("price" >= 0) NOT VALID;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_rating_range" CHECK ("rating" BETWEEN 1 AND 5) NOT VALID;
