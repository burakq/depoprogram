import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const periodId = Number(searchParams.get("periodId"));

  if (!periodId) return NextResponse.json({ error: "periodId gerekli" }, { status: 400 });

  const period = await prisma.period.findUnique({ where: { id: periodId } });
  if (!period) return NextResponse.json({ error: "Dönem bulunamadı" }, { status: 404 });

  // Dönem tarih aralığındaki satışları çek
  const salesItems = await prisma.salesItem.findMany({
    where: {
      businessDate: { gte: period.startDate, lte: period.endDate },
    },
    include: {
      simpraProduct: {
        include: {
          recipes: { include: { depotProduct: true } },
        },
      },
    },
  });

  // Depo ürünü başına teorik tüketimi hesapla
  const consumption = new Map<number, { product: { id: number; name: string; unit: string }; totalCl: number }>();

  for (const item of salesItems) {
    for (const recipe of item.simpraProduct.recipes) {
      const key = recipe.depotProductId;
      const used = item.netSalesQty * recipe.clAmount;
      if (!consumption.has(key)) {
        consumption.set(key, { product: recipe.depotProduct, totalCl: 0 });
      }
      consumption.get(key)!.totalCl += used;
    }
  }

  // Stok girişlerini çek
  const stockEntries = await prisma.stockEntry.findMany({
    where: { periodId },
    include: { depotProduct: true },
  });

  // Bar sayımlarını çek
  const barCounts = await prisma.barCount.findMany({
    where: { periodId },
    include: { depotProduct: true },
  });

  // Tüm depo ürünlerini topla
  const allProductIds = new Set<number>();
  stockEntries.forEach((e) => allProductIds.add(e.depotProductId));
  barCounts.forEach((c) => allProductIds.add(c.depotProductId));
  consumption.forEach((_, k) => allProductIds.add(k));

  const depotProducts = await prisma.depotProduct.findMany({
    where: { id: { in: Array.from(allProductIds) } },
  });

  const rows = depotProducts.map((dp) => {
    const stock = stockEntries.find((e) => e.depotProductId === dp.id);
    const barCount = barCounts.find((c) => c.depotProductId === dp.id);
    const cons = consumption.get(dp.id);

    const openingCl = stock?.openingCl ?? 0;
    const incomingCl = stock?.incomingCl ?? 0;
    const theoreticalConsumptionCl = cons?.totalCl ?? 0;
    const theoreticalRemainingCl = openingCl + incomingCl - theoreticalConsumptionCl;
    const actualCountCl = barCount?.countedCl ?? null;
    const discrepancyCl =
      actualCountCl !== null ? actualCountCl - theoreticalRemainingCl : null;

    return {
      depotProduct: dp,
      openingCl,
      incomingCl,
      theoreticalConsumptionCl,
      theoreticalRemainingCl,
      actualCountCl,
      discrepancyCl, // pozitif = fazla, negatif = açık/fire
      hasStock: stock !== null,
      hasCount: barCount !== null,
    };
  });

  // Satış bazlı detay (hangi ürün ne kadar tüketmiş)
  const consumptionDetail = Array.from(consumption.entries()).map(([, v]) => ({
    depotProduct: v.product,
    totalCl: v.totalCl,
    totalLt: v.totalCl / 100,
  }));

  return NextResponse.json({
    period,
    rows: rows.sort((a, b) => a.depotProduct.name.localeCompare(b.depotProduct.name)),
    consumptionDetail: consumptionDetail.sort((a, b) => b.totalCl - a.totalCl),
    totalSalesItems: salesItems.length,
  });
}
