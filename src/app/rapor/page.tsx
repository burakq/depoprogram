"use client";
import { useEffect, useState } from "react";

interface Period {
  id: number;
  label: string;
  startDate: string;
  endDate: string;
}

interface ReportRow {
  depotProduct: { id: number; name: string; unit: string };
  openingCl: number;
  incomingCl: number;
  theoreticalConsumptionCl: number;
  theoreticalRemainingCl: number;
  actualCountCl: number | null;
  discrepancyCl: number | null;
  hasStock: boolean;
  hasCount: boolean;
}

interface ConsumptionDetail {
  depotProduct: { name: string };
  totalCl: number;
  totalLt: number;
}

interface Report {
  period: Period;
  rows: ReportRow[];
  consumptionDetail: ConsumptionDetail[];
  totalSalesItems: number;
}

export default function RaporPage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"summary" | "detail">("summary");

  useEffect(() => {
    fetch("/api/periods").then((r) => r.json()).then(setPeriods);
  }, []);

  const loadReport = async (id: string) => {
    if (!id) return;
    setLoading(true);
    const r = await fetch(`/api/report?periodId=${id}`);
    const data = await r.json();
    setReport(data);
    setLoading(false);
  };

  const cl = (v: number) => `${v.toFixed(1)} cl`;
  const lt = (v: number) => `${(v / 100).toFixed(3)} lt`;

  const discColor = (v: number | null) => {
    if (v === null) return "text-gray-500";
    if (v < -10) return "text-red-400 font-bold";
    if (v < 0) return "text-red-300";
    if (v > 10) return "text-green-400";
    return "text-green-300";
  };

  const discLabel = (v: number | null) => {
    if (v === null) return "—";
    if (v < 0) return `▼ ${cl(Math.abs(v))} AÇIK`;
    if (v > 0) return `▲ ${cl(v)} FAZLA`;
    return "✓ Eşit";
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-amber-400 mb-6">Haftalık Rapor</h1>

      <div className="flex gap-3 mb-6 flex-wrap items-end">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Dönem Seç</label>
          <select
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
            value={selectedId}
            onChange={(e) => {
              setSelectedId(e.target.value);
              loadReport(e.target.value);
            }}
          >
            <option value="">Dönem seç...</option>
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} ({new Date(p.startDate).toLocaleDateString("tr-TR")} –{" "}
                {new Date(p.endDate).toLocaleDateString("tr-TR")})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p className="text-gray-400">Hesaplanıyor...</p>}

      {report && !loading && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="text-xs text-gray-500">Satış Satırı</div>
              <div className="text-xl font-bold text-white">{report.totalSalesItems.toLocaleString("tr")}</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="text-xs text-gray-500">Takip Edilen Ürün</div>
              <div className="text-xl font-bold text-white">{report.rows.length}</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-red-900/50">
              <div className="text-xs text-gray-500">Açık Ürün Sayısı</div>
              <div className="text-xl font-bold text-red-400">
                {report.rows.filter((r) => r.discrepancyCl !== null && r.discrepancyCl < 0).length}
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-green-900/50">
              <div className="text-xs text-gray-500">Toplam Açık (cl)</div>
              <div className="text-xl font-bold text-red-400">
                {cl(
                  report.rows.reduce(
                    (acc, r) => acc + (r.discrepancyCl !== null && r.discrepancyCl < 0 ? r.discrepancyCl : 0),
                    0
                  )
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setTab("summary")}
              className={`px-4 py-1.5 rounded text-sm font-medium ${
                tab === "summary" ? "bg-amber-500 text-gray-900" : "bg-gray-800 text-gray-300"
              }`}
            >
              Açık/Fazla Özeti
            </button>
            <button
              onClick={() => setTab("detail")}
              className={`px-4 py-1.5 rounded text-sm font-medium ${
                tab === "detail" ? "bg-amber-500 text-gray-900" : "bg-gray-800 text-gray-300"
              }`}
            >
              Tüketim Detayı
            </button>
          </div>

          {tab === "summary" ? (
            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-xs">
                    <th className="text-left px-4 py-3">Ürün</th>
                    <th className="text-right px-4 py-3">Açılış</th>
                    <th className="text-right px-4 py-3">Gelen</th>
                    <th className="text-right px-4 py-3">Teorik Tüketim</th>
                    <th className="text-right px-4 py-3">Teorik Kalan</th>
                    <th className="text-right px-4 py-3">Bar Sayımı</th>
                    <th className="text-right px-4 py-3">FARK</th>
                  </tr>
                </thead>
                <tbody>
                  {report.rows.map((row) => (
                    <tr
                      key={row.depotProduct.id}
                      className={`border-b border-gray-800/50 ${
                        row.discrepancyCl !== null && row.discrepancyCl < -10
                          ? "bg-red-950/20"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-medium">{row.depotProduct.name}</td>
                      <td className="px-4 py-3 text-right text-gray-400">
                        {row.hasStock ? cl(row.openingCl) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400">
                        {row.hasStock ? cl(row.incomingCl) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-amber-300">
                        {cl(row.theoreticalConsumptionCl)}
                        <div className="text-xs text-gray-500">{lt(row.theoreticalConsumptionCl)}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-blue-300">
                        {row.hasStock ? cl(row.theoreticalRemainingCl) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.actualCountCl !== null ? (
                          <span className="text-white">{cl(row.actualCountCl)}</span>
                        ) : (
                          <span className="text-gray-600">Sayım yok</span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-right ${discColor(row.discrepancyCl)}`}>
                        {discLabel(row.discrepancyCl)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-x-auto">
              <p className="px-4 py-2 text-xs text-gray-500 border-b border-gray-800">
                Reçete bazlı hesaplanan teorik tüketim — satış adedi × reçete CL
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-xs">
                    <th className="text-left px-4 py-3">Depo Ürünü</th>
                    <th className="text-right px-4 py-3">Teorik Tüketim (cl)</th>
                    <th className="text-right px-4 py-3">Teorik Tüketim (lt)</th>
                  </tr>
                </thead>
                <tbody>
                  {report.consumptionDetail.map((d, i) => (
                    <tr key={i} className="border-b border-gray-800/50">
                      <td className="px-4 py-3 font-medium">{d.depotProduct.name}</td>
                      <td className="px-4 py-3 text-right text-amber-300">{d.totalCl.toFixed(1)}</td>
                      <td className="px-4 py-3 text-right text-amber-400">{d.totalLt.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
