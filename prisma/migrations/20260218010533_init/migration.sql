-- CreateTable
CREATE TABLE "Property" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
    "location" TEXT NOT NULL
);
