"use client";
import { useEffect, useRef, useState } from "react";

interface ImportRecord {
  id: number;
  fileName: string;
  startDate: string;
  endDate: string;
  importedAt: string;
  _count: { salesItems: number };
}

export default function ImportPage() {
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () =>
    fetch("/api/import").then((r) => r.json()).then(setImports);

  useEffect(() => { load(); }, []);

  const upload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    setResult("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/import", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) {
      setResult(
        `✓ ${data.rowCount} satır içe aktarıldı — ${data.uniqueProducts} benzersiz ürün — ${fmt(data.startDate)} → ${fmt(data.endDate)}`
      );
      load();
      if (fileRef.current) fileRef.current.value = "";
    } else {
      setResult(`Hata: ${data.error}`);
    }
    setUploading(false);
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString("tr-TR");

  return (
    <div>
      <h1 className="text-2xl font-bold text-amber-400 mb-6">Simpra Raporunu İçe Aktar</h1>
      <p className="text-gray-400 text-sm mb-6">
        Simpra&apos;dan &quot;Ürün Raporu&quot; olarak indirdiğin xlsx dosyasını yükle.
        Her yüklemede yeni kayıt oluşur — aynı dosyayı tekrar yüklersen çift kayıt oluşur.
      </p>

      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 mb-6">
        <div className="flex gap-3 flex-wrap items-end">
          <div>
            <label className="text-xs text-gray-400 block mb-1">xlsx Dosyası</label>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
            />
          </div>
          <button
            onClick={upload}
            disabled={uploading}
            className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold px-5 py-2 rounded disabled:opacity-50"
          >
            {uploading ? "Yükleniyor..." : "İçe Aktar"}
          </button>
        </div>
        {result && (
          <p
            className={`mt-3 text-sm ${result.startsWith("✓") ? "text-green-400" : "text-red-400"}`}
          >
            {result}
          </p>
        )}
      </div>

      <h2 className="font-semibold text-gray-300 mb-3">Geçmiş Yüklemeler</h2>
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        {imports.length === 0 ? (
          <p className="p-6 text-gray-500 text-center">Henüz yükleme yapılmadı</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="text-left px-4 py-3">Dosya</th>
                <th className="text-left px-4 py-3">Tarih Aralığı</th>
                <th className="text-left px-4 py-3">Satır</th>
                <th className="text-left px-4 py-3">Yüklenme</th>
              </tr>
            </thead>
            <tbody>
              {imports.map((imp) => (
                <tr key={imp.id} className="border-b border-gray-800/50">
                  <td className="px-4 py-3 text-white">{imp.fileName}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {fmt(imp.startDate)} – {fmt(imp.endDate)}
                  </td>
                  <td className="px-4 py-3 text-amber-400">{imp._count.salesItems.toLocaleString("tr")}</td>
                  <td className="px-4 py-3 text-gray-500">{fmt(imp.importedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
