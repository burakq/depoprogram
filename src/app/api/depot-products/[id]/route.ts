import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.depotProduct.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, unit } = await req.json();
  const product = await prisma.depotProduct.update({
    where: { id: Number(id) },
    data: { name: name.trim(), unit },
  });
  return NextResponse.json(product);
}
