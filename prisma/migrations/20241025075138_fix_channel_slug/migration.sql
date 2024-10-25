/*
  Warnings:

  - You are about to drop the `Contacts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SponsorChannels` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Contacts";

-- DropTable
DROP TABLE "SponsorChannels";

-- CreateTable
CREATE TABLE "SponsorChannel" (
    "id" SERIAL NOT NULL,
    "channelName" TEXT NOT NULL,
    "channelLink" TEXT NOT NULL,
    "channelSlug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expirationDate" DATE NOT NULL,
    "sponsorName" TEXT NOT NULL,
    "sponsorLink" TEXT NOT NULL,

    CONSTRAINT "SponsorChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" SERIAL NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactLink" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);
