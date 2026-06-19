"use client";
import { useEffect, useState } from "react";

interface DepotProduct {
  id: number;
  name: string;
  unit: string;
}

export default function UrunlerPage() {
  const [products, setProducts] = useState<DepotProduct[]>([]);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("cl");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = () =>
    fetch("/api/depot-products")
      .then((r) => r.json())
      .then(setProducts);

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/depot-products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, unit }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Hata");
    } else {
      setName("");
      load();
    }
    setLoading(false);
  };

  const del = async (id: number) => {
    if (!confirm("Sil?")) return;
    await fetch(`/api/depot-products/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-amber-400 mb-6">Depo Ürünleri</h1>
      <p className="text-gray-400 text-sm mb-6">
        Deponda tuttuğun ham alkol ürünlerini buraya ekle. Reçetelerde bu ürünlere CL atayacaksın.
      </p>

      <div className="bg-gray-900 rounded-lg p-5 mb-6 border border-gray-800">
        <div className="flex gap-3 flex-wrap">
          <input
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white flex-1 min-w-48"
            placeholder="Ürün adı (örn: Beefeater Gin)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <select
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          >
            <option value="cl">cl</option>
            <option value="ml">ml</option>
            <option value="lt">lt</option>
          </select>
          <button
            onClick={add}
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold px-5 py-2 rounded disabled:opacity-50"
          >
            Ekle
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        {products.length === 0 ? (
          <p className="p-6 text-gray-500 text-center">Henüz ürün eklenmedi</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="text-left px-4 py-3">Ürün Adı</th>
                <th className="text-left px-4 py-3">Birim</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-gray-400">{p.unit}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => del(p.id)}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
