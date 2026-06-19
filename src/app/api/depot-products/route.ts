import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.depotProduct.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const { name, unit } = await req.json();
  if (!name) return NextResponse.json({ error: "İsim zorunlu" }, { status: 400 });
  // upsert — varsa döndür, yoksa oluştur
  const product = await prisma.depotProduct.upsert({
    where: { name: name.trim() },
    update: {},
    create: { name: name.trim(), unit: unit || "cl" },
  });
  return NextResponse.json(product);
}
