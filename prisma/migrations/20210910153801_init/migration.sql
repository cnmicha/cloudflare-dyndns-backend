-- CreateTable
CREATE TABLE "CloudflareDnsZone" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "authToken" VARCHAR(255) NOT NULL,

    CONSTRAINT "CloudflareDnsZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CloudflareDnsRecord" (
    "id" SERIAL NOT NULL,
    "cloudflareDnsZoneId" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(8) NOT NULL,
    "lastIpAddress" VARCHAR(45),
    "lastIpAddressTimestamp" TIMESTAMP(3),
    "lastUpdateWasSuccessful" BOOLEAN,
    "authKey" VARCHAR(64) NOT NULL,

    CONSTRAINT "CloudflareDnsRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CloudflareDnsZone_name_key" ON "CloudflareDnsZone"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CloudflareDnsRecord_name_key" ON "CloudflareDnsRecord"("name");

-- AddForeignKey
ALTER TABLE "CloudflareDnsRecord" ADD CONSTRAINT "CloudflareDnsRecord_cloudflareDnsZoneId_fkey" FOREIGN KEY ("cloudflareDnsZoneId") REFERENCES "CloudflareDnsZone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
