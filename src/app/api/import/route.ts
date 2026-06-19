import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: false });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

  if (!rows.length) return NextResponse.json({ error: "Boş dosya" }, { status: 400 });

  // Detect column names
  const firstRow = rows[0];
  const keys = Object.keys(firstRow);
  const findKey = (...parts: string[]) =>
    keys.find((k) => parts.every((p) => k.toLowerCase().includes(p.toLowerCase())));

  const dateKey = findKey("iş günü") || findKey("İş Günü") || findKey("tarih") || keys[0];
  const nameKey = findKey("ürün adı") || findKey("Ürün Adı") || keys[1];
  const catKey = findKey("kategori") || findKey("Kategori") || keys[2];
  const netQtyKey = findKey("net satış mikt") || findKey("Net Satış Mikt") || keys[16];
  const grossQtyKey = findKey("brüt satış sayısı") || findKey("Brüt Satış Sayısı") || keys[7];

  let minDate: Date | null = null;
  let maxDate: Date | null = null;
  const productMap = new Map<string, { id: number; category: string }>();

  // Ensure SimpraProducts exist
  const uniqueProducts = new Map<string, string>();
  for (const row of rows) {
    const name = String(row[nameKey] || "").trim();
    const cat = String(row[catKey] || "").trim();
    if (name) uniqueProducts.set(name, cat);
  }

  for (const [name, category] of uniqueProducts) {
    const p = await prisma.simpraProduct.upsert({
      where: { name },
      update: { category },
      create: { name, category },
    });
    productMap.set(name, { id: p.id, category });
  }

  // Parse rows
  const salesItems: {
    simpraProductId: number;
    businessDate: Date;
    netSalesQty: number;
    grossSalesQty: number;
  }[] = [];

  for (const row of rows) {
    const name = String(row[nameKey] || "").trim();
    const product = productMap.get(name);
    if (!product) continue;

    let dateVal = row[dateKey];
    let date: Date;
    if (typeof dateVal === "number") {
      // Excel serial number — parse directly to y/m/d (no timezone issues)
      const d = XLSX.SSF.parse_date_code(dateVal);
      date = new Date(Date.UTC(d.y, d.m - 1, d.d, 12, 0, 0));
    } else if (dateVal instanceof Date) {
      date = new Date(Date.UTC(dateVal.getFullYear(), dateVal.getMonth(), dateVal.getDate(), 12, 0, 0));
    } else {
      const parts = String(dateVal).split(/[.\-\/]/);
      if (parts.length === 3 && parts[0].length === 2) {
        // Turkish format: dd.mm.yyyy
        date = new Date(Date.UTC(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]), 12, 0, 0));
      } else {
        date = new Date(String(dateVal));
      }
    }

    if (isNaN(date.getTime())) continue;

    if (!minDate || date < minDate) minDate = date;
    if (!maxDate || date > maxDate) maxDate = date;

    const netQty = parseFloat(String(row[netQtyKey] || 0)) || 0;
    const grossQty = parseFloat(String(row[grossQtyKey] || 0)) || 0;

    salesItems.push({
      simpraProductId: product.id,
      businessDate: date,
      netSalesQty: netQty,
      grossSalesQty: grossQty,
    });
  }

  const importRecord = await prisma.simpraImport.create({
    data: {
      fileName: file.name,
      startDate: minDate || new Date(),
      endDate: maxDate || new Date(),
      salesItems: { createMany: { data: salesItems } },
    },
  });

  return NextResponse.json({
    id: importRecord.id,
    fileName: file.name,
    rowCount: salesItems.length,
    startDate: minDate,
    endDate: maxDate,
    uniqueProducts: uniqueProducts.size,
  });
}

export async function GET() {
  const imports = await prisma.simpraImport.findMany({
    orderBy: { importedAt: "desc" },
    include: { _count: { select: { salesItems: true } } },
  });
  return NextResponse.json(imports);
}
