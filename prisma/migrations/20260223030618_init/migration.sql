-- CreateTable
CREATE TABLE "Property" (
    "id" SERIAL NOT NULL,
    "externalId" TEXT,
    "sourceUrl" TEXT,
    "type" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "deposit" INTEGER,
    "keyMoney" INTEGER,
    "nearestStation" TEXT NOT NULL,
    "walkTime" INTEGER NOT NULL,
    "furnished" BOOLEAN NOT NULL,
    "foreignerFriendly" BOOLEAN NOT NULL,
    "photos" JSONB NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "descriptionJp" TEXT,
    "location" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "availableFrom" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pricingPlans" JSONB,
    "tags" JSONB,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Property_externalId_key" ON "Property"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Property_sourceUrl_key" ON "Property"("sourceUrl");
