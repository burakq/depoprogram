import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.simpraProduct.findMany({
    orderBy: { name: "asc" },
    include: { recipes: { include: { depotProduct: true } } },
  });
  return NextResponse.json(products);
}
