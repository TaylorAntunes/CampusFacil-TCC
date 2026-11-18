ALTER TABLE "users"
ADD COLUMN "location" TEXT,
ADD COLUMN "response_time" TEXT,
ADD COLUMN "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];
