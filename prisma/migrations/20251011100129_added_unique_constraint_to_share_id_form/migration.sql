/*
  Warnings:

  - A unique constraint covering the columns `[shareId]` on the table `Form` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Form_shareId_key" ON "Form"("shareId");
