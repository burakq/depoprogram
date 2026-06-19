-- CreateTable
CREATE TABLE "DepotProduct" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'cl',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DepotProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimpraProduct" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    CONSTRAINT "SimpraProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" SERIAL NOT NULL,
    "simpraProductId" INTEGER NOT NULL,
    "depotProductId" INTEGER NOT NULL,
    "clAmount" DOUBLE PRECISION NOT NULL,
    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimpraImport" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SimpraImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesItem" (
    "id" SERIAL NOT NULL,
    "importId" INTEGER NOT NULL,
    "simpraProductId" INTEGER NOT NULL,
    "businessDate" TIMESTAMP(3) NOT NULL,
    "netSalesQty" DOUBLE PRECISION NOT NULL,
    "grossSalesQty" DOUBLE PRECISION NOT NULL,
    CONSTRAINT "SalesItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Period" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Period_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockEntry" (
    "id" SERIAL NOT NULL,
    "periodId" INTEGER NOT NULL,
    "depotProductId" INTEGER NOT NULL,
    "openingCl" DOUBLE PRECISION NOT NULL,
    "incomingCl" DOUBLE PRECISION NOT NULL DEFAULT 0,
    CONSTRAINT "StockEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BarCount" (
    "id" SERIAL NOT NULL,
    "periodId" INTEGER NOT NULL,
    "depotProductId" INTEGER NOT NULL,
    "countedCl" DOUBLE PRECISION NOT NULL,
    "countedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BarCount_pkey" PRIMARY KEY ("id")
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

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_simpraProductId_fkey" FOREIGN KEY ("simpraProductId") REFERENCES "SimpraProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_depotProductId_fkey" FOREIGN KEY ("depotProductId") REFERENCES "DepotProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesItem" ADD CONSTRAINT "SalesItem_importId_fkey" FOREIGN KEY ("importId") REFERENCES "SimpraImport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesItem" ADD CONSTRAINT "SalesItem_simpraProductId_fkey" FOREIGN KEY ("simpraProductId") REFERENCES "SimpraProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockEntry" ADD CONSTRAINT "StockEntry_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockEntry" ADD CONSTRAINT "StockEntry_depotProductId_fkey" FOREIGN KEY ("depotProductId") REFERENCES "DepotProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarCount" ADD CONSTRAINT "BarCount_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarCount" ADD CONSTRAINT "BarCount_depotProductId_fkey" FOREIGN KEY ("depotProductId") REFERENCES "DepotProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
