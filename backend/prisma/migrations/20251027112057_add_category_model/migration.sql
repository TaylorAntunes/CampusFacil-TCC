/*
  Warnings:

  - You are about to drop the column `category` on the `advertisements` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `advertisements` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "advertisements" DROP COLUMN "category",
ADD COLUMN     "categoryId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- AddForeignKey
ALTER TABLE "advertisements" ADD CONSTRAINT "advertisements_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
