import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const periodId = Number(searchParams.get("periodId"));
  const entries = await prisma.stockEntry.findMany({
    where: { periodId },
    include: { depotProduct: true },
  });
  return NextResponse.json(entries);
}

export async function POST(req: Request) {
  const { periodId, depotProductId, openingCl, incomingCl } = await req.json();
  const entry = await prisma.stockEntry.upsert({
    where: { periodId_depotProductId: { periodId, depotProductId } },
    update: { openingCl, incomingCl },
    create: { periodId, depotProductId, openingCl, incomingCl: incomingCl || 0 },
  });
  return NextResponse.json(entry);
}
