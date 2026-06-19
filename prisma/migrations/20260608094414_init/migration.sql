-- CreateTable
CREATE TABLE "DepotProduct" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'cl',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SimpraProduct" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "simpraProductId" INTEGER NOT NULL,
    "depotProductId" INTEGER NOT NULL,
    "clAmount" REAL NOT NULL,
    CONSTRAINT "Recipe_simpraProductId_fkey" FOREIGN KEY ("simpraProductId") REFERENCES "SimpraProduct" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Recipe_depotProductId_fkey" FOREIGN KEY ("depotProductId") REFERENCES "DepotProduct" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SimpraImport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fileName" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SalesItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "importId" INTEGER NOT NULL,
    "simpraProductId" INTEGER NOT NULL,
    "businessDate" DATETIME NOT NULL,
    "netSalesQty" REAL NOT NULL,
    "grossSalesQty" REAL NOT NULL,
    CONSTRAINT "SalesItem_importId_fkey" FOREIGN KEY ("importId") REFERENCES "SimpraImport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SalesItem_simpraProductId_fkey" FOREIGN KEY ("simpraProductId") REFERENCES "SimpraProduct" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Period" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "StockEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "periodId" INTEGER NOT NULL,
    "depotProductId" INTEGER NOT NULL,
    "openingCl" REAL NOT NULL,
    "incomingCl" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "StockEntry_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StockEntry_depotProductId_fkey" FOREIGN KEY ("depotProductId") REFERENCES "DepotProduct" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BarCount" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "periodId" INTEGER NOT NULL,
    "depotProductId" INTEGER NOT NULL,
    "countedCl" REAL NOT NULL,
    "countedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BarCount_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BarCount_depotProductId_fkey" FOREIGN KEY ("depotProductId") REFERENCES "DepotProduct" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DepotProduct_name_key" ON "DepotProduct"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SimpraProduct_name_key" ON "SimpraProduct"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_simpraProductId_depotProductId_key" ON "Recipe"("simpraProductId", "depotProductId");

-- CreateIndex
CREATE UNIQUE INDEX "StockEntry_periodId_depotProductId_key" ON "StockEntry"("periodId", "depotProductId");

-- CreateIndex
CREATE UNIQUE INDEX "BarCount_periodId_depotProductId_key" ON "BarCount"("periodId", "depotProductId");
