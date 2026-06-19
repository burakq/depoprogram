"use client";
import { useEffect, useState } from "react";

interface Period {
  id: number;
  label: string;
  startDate: string;
  endDate: string;
  _count: { stockEntries: number; barCounts: number };
}

interface DepotProduct {
  id: number;
  name: string;
  unit: string;
}

interface StockEntry {
  id: number;
  depotProductId: number;
  openingCl: number;
  incomingCl: number;
  depotProduct: DepotProduct;
}

interface BarCount {
  id: number;
  depotProductId: number;
  countedCl: number;
  depotProduct: DepotProduct;
}

type Tab = "stock" | "barcount";

export default function DonemlerPage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [depotProducts, setDepotProducts] = useState<DepotProduct[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);
  const [tab, setTab] = useState<Tab>("stock");

  // New period form
  const [label, setLabel] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Stock entries
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [barCounts, setBarCounts] = useState<BarCount[]>([]);
  const [editValues, setEditValues] = useState<Record<number, { opening: string; incoming: string }>>({});
  const [countValues, setCountValues] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);

  const loadPeriods = () =>
    fetch("/api/periods").then((r) => r.json()).then(setPeriods);

  const loadPeriodData = async (p: Period) => {
    const [se, bc] = await Promise.all([
      fetch(`/api/stock-entries?periodId=${p.id}`).then((r) => r.json()),
      fetch(`/api/bar-counts?periodId=${p.id}`).then((r) => r.json()),
    ]);
    setStockEntries(se);
    setBarCounts(bc);

    const ev: Record<number, { opening: string; incoming: string }> = {};
    depotProducts.forEach((dp) => {
      const existing = se.find((e: StockEntry) => e.depotProductId === dp.id);
      ev[dp.id] = {
        opening: existing ? String(existing.openingCl) : "",
        incoming: existing ? String(existing.incomingCl) : "",
      };
    });
    setEditValues(ev);

    const cv: Record<number, string> = {};
    depotProducts.forEach((dp) => {
      const existing = bc.find((c: BarCount) => c.depotProductId === dp.id);
      cv[dp.id] = existing ? String(existing.countedCl) : "";
    });
    setCountValues(cv);
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/periods").then((r) => r.json()),
      fetch("/api/depot-products").then((r) => r.json()),
    ]).then(([p, d]) => {
      setPeriods(p);
      setDepotProducts(d);
    });
  }, []);

  useEffect(() => {
    if (selectedPeriod && depotProducts.length > 0) {
      loadPeriodData(selectedPeriod);
    }
  }, [selectedPeriod, depotProducts]);

  const createPeriod = async () => {
    if (!label || !startDate || !endDate) return;
    await fetch("/api/periods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, startDate, endDate }),
    });
    setLabel(""); setStartDate(""); setEndDate("");
    loadPeriods();
  };

  const saveStock = async () => {
    if (!selectedPeriod) return;
    setSaving(true);
    for (const dp of depotProducts) {
      const v = editValues[dp.id];
      if (!v || (v.opening === "" && v.incoming === "")) continue;
      await fetch("/api/stock-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodId: selectedPeriod.id,
          depotProductId: dp.id,
          openingCl: parseFloat(v.opening) || 0,
          incomingCl: parseFloat(v.incoming) || 0,
        }),
      });
    }
    await loadPeriodData(selectedPeriod);
    loadPeriods();
    setSaving(false);
  };

  const saveBarCount = async () => {
    if (!selectedPeriod) return;
    setSaving(true);
    for (const dp of depotProducts) {
      const v = countValues[dp.id];
      if (v === "" || v === undefined) continue;
      await fetch("/api/bar-counts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodId: selectedPeriod.id,
          depotProductId: dp.id,
          countedCl: parseFloat(v) || 0,
        }),
      });
    }
    await loadPeriodData(selectedPeriod);
    loadPeriods();
    setSaving(false);
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString("tr-TR");
  void stockEntries; void barCounts;

  return (
    <div className="flex gap-4 h-[calc(100vh-120px)]">
      {/* Sol panel */}
      <div className="w-72 flex flex-col gap-3">
        {/* Yeni dönem */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <h2 className="font-semibold text-amber-400 mb-3 text-sm">Yeni Dönem</h2>
          <input
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white mb-2"
            placeholder="Dönem adı (örn: Haziran H1)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <div className="flex gap-2 mb-2">
            <input
              type="date"
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white flex-1"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white flex-1"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button
            onClick={createPeriod}
            className="w-full bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold py-1.5 rounded text-sm"
          >
            Oluştur
          </button>
        </div>

        {/* Dönem listesi */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 flex-1 overflow-y-auto">
          <div className="p-3 border-b border-gray-800 text-sm font-semibold text-gray-300">Dönemler</div>
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPeriod(p)}
              className={`w-full text-left px-3 py-2.5 border-b border-gray-800/50 text-sm hover:bg-gray-800 ${
                selectedPeriod?.id === p.id ? "bg-gray-800 border-l-2 border-l-amber-500" : ""
              }`}
            >
              <div className="font-medium text-white">{p.label}</div>
              <div className="text-xs text-gray-500">{fmt(p.startDate)} – {fmt(p.endDate)}</div>
              <div className="text-xs text-gray-600 mt-0.5">
                Stok: {p._count.stockEntries} · Sayım: {p._count.barCounts}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Sağ panel */}
      <div className="flex-1 bg-gray-900 rounded-lg border border-gray-800 flex flex-col">
        {!selectedPeriod ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            Bir dönem seç
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-800">
              <h2 className="font-bold text-white">{selectedPeriod.label}</h2>
              <p className="text-sm text-gray-400">{fmt(selectedPeriod.startDate)} – {fmt(selectedPeriod.endDate)}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setTab("stock")}
                  className={`px-4 py-1.5 rounded text-sm font-medium ${
                    tab === "stock" ? "bg-amber-500 text-gray-900" : "bg-gray-800 text-gray-300"
                  }`}
                >
                  Açılış Stoku
                </button>
                <button
                  onClick={() => setTab("barcount")}
                  className={`px-4 py-1.5 rounded text-sm font-medium ${
                    tab === "barcount" ? "bg-amber-500 text-gray-900" : "bg-gray-800 text-gray-300"
                  }`}
                >
                  Bar Sayımı
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {depotProducts.length === 0 ? (
                <p className="text-yellow-400 text-sm">Önce Depo Ürünleri ekle</p>
              ) : tab === "stock" ? (
                <>
                  <p className="text-xs text-gray-500 mb-3">
                    Dönem başındaki stok miktarları ve dönem içinde bara çıkan miktarları gir (cl cinsinden)
                  </p>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-800">
                        <th className="text-left py-2">Ürün</th>
                        <th className="text-left py-2 w-36">Açılış (cl)</th>
                        <th className="text-left py-2 w-36">Gelen (cl)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {depotProducts.map((dp) => (
                        <tr key={dp.id} className="border-b border-gray-800/40">
                          <td className="py-2 pr-3 font-medium">{dp.name}</td>
                          <td className="py-2 pr-2">
                            <input
                              type="number"
                              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 w-32 text-white text-sm"
                              placeholder="0"
                              value={editValues[dp.id]?.opening || ""}
                              onChange={(e) =>
                                setEditValues((prev) => ({
                                  ...prev,
                                  [dp.id]: { ...prev[dp.id], opening: e.target.value },
                                }))
                              }
                            />
                          </td>
                          <td className="py-2">
                            <input
                              type="number"
                              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 w-32 text-white text-sm"
                              placeholder="0"
                              value={editValues[dp.id]?.incoming || ""}
                              onChange={(e) =>
                                setEditValues((prev) => ({
                                  ...prev,
                                  [dp.id]: { ...prev[dp.id], incoming: e.target.value },
                                }))
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    onClick={saveStock}
                    disabled={saving}
                    className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded disabled:opacity-50"
                  >
                    {saving ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-xs text-gray-500 mb-3">
                    Bar sayımı sonucu gerçek kalan miktarları gir (cl cinsinden)
                  </p>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-800">
                        <th className="text-left py-2">Ürün</th>
                        <th className="text-left py-2 w-36">Sayım (cl)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {depotProducts.map((dp) => (
                        <tr key={dp.id} className="border-b border-gray-800/40">
                          <td className="py-2 pr-3 font-medium">{dp.name}</td>
                          <td className="py-2">
                            <input
                              type="number"
                              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 w-32 text-white text-sm"
                              placeholder="0"
                              value={countValues[dp.id] || ""}
                              onChange={(e) =>
                                setCountValues((prev) => ({ ...prev, [dp.id]: e.target.value }))
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    onClick={saveBarCount}
                    disabled={saving}
                    className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded disabled:opacity-50"
                  >
                    {saving ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
