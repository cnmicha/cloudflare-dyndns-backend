/*
  Warnings:

  - A unique constraint covering the columns `[name,type]` on the table `CloudflareDnsRecord` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "CloudflareDnsRecord_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "CloudflareDnsRecord_name_type_key" ON "CloudflareDnsRecord"("name", "type");
