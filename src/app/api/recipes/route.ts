import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { simpraProductId, depotProductId, clAmount } = await req.json();
  try {
    const recipe = await prisma.recipe.upsert({
      where: { simpraProductId_depotProductId: { simpraProductId, depotProductId } },
      update: { clAmount },
      create: { simpraProductId, depotProductId, clAmount },
    });
    return NextResponse.json(recipe);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.recipe.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
