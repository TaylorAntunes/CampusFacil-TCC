-- DropForeignKey
ALTER TABLE "public"."service_requests" DROP CONSTRAINT "service_requests_advertisementId_fkey";

-- AlterTable
ALTER TABLE "service_requests" ALTER COLUMN "advertisementId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_advertisementId_fkey" FOREIGN KEY ("advertisementId") REFERENCES "advertisements"("id") ON DELETE SET NULL ON UPDATE CASCADE;
