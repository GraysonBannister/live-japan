-- CreateTable
CREATE TABLE "Property" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
    "lat" REAL,
    "lng" REAL,
    "availableFrom" DATETIME,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Property_externalId_key" ON "Property"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Property_sourceUrl_key" ON "Property"("sourceUrl");
