/*
  Warnings:

  - A unique constraint covering the columns `[reviewerId,advertisementId]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "reviews_reviewerId_advertisementId_key" ON "reviews"("reviewerId", "advertisementId");
