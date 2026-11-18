-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "read" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar_url" TEXT;
