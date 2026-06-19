import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const periodId = Number(searchParams.get("periodId"));
  const counts = await prisma.barCount.findMany({
    where: { periodId },
    include: { depotProduct: true },
  });
  return NextResponse.json(counts);
}

export async function POST(req: Request) {
  const { periodId, depotProductId, countedCl } = await req.json();
  const count = await prisma.barCount.upsert({
    where: { periodId_depotProductId: { periodId, depotProductId } },
    update: { countedCl },
    create: { periodId, depotProductId, countedCl },
  });
  return NextResponse.json(count);
}
