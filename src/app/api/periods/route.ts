import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const periods = await prisma.period.findMany({
    orderBy: { startDate: "desc" },
    include: {
      _count: { select: { stockEntries: true, barCounts: true } },
    },
  });
  return NextResponse.json(periods);
}

export async function POST(req: Request) {
  const { label, startDate, endDate } = await req.json();
  // Parse as UTC noon to match import date storage
  const toNoon = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  };
  const period = await prisma.period.create({
    data: { label, startDate: toNoon(startDate), endDate: toNoon(endDate) },
  });
  return NextResponse.json(period);
}
