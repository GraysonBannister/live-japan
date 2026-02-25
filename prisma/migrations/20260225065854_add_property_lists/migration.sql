-- CreateTable
CREATE TABLE "List" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ListItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "listId" INTEGER NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ListItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ListItem_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "List_userId_idx" ON "List"("userId");

-- CreateIndex
CREATE INDEX "ListItem_listId_idx" ON "ListItem"("listId");

-- CreateIndex
CREATE INDEX "ListItem_propertyId_idx" ON "ListItem"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "ListItem_listId_propertyId_key" ON "ListItem"("listId", "propertyId");
