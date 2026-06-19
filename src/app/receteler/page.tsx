"use client";
import { useEffect, useState, useRef } from "react";

interface DepotProduct { id: number; name: string; unit: string; }
interface Recipe { id: number; clAmount: number; depotProduct: DepotProduct; }
interface SimpraProduct { id: number; name: string; category: string; recipes: Recipe[]; }

export default function RecetelerPage() {
  const [simpraProducts, setSimpraProducts] = useState<SimpraProduct[]>([]);
  const [depotProducts, setDepotProducts] = useState<DepotProduct[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<SimpraProduct | null>(null);
  const [filterNoRecipe, setFilterNoRecipe] = useState(false);
  const [filterAlcohol, setFilterAlcohol] = useState(true);
  const [newDepotName, setNewDepotName] = useState("");
  const [newCl, setNewCl] = useState("");
  const [saving, setSaving] = useState(false);
  const [suggestions, setSuggestions] = useState<DepotProduct[]>([]);
  const [showSug, setShowSug] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const [sp, dp] = await Promise.all([
      fetch("/api/simpra-products").then((r) => r.json()),
      fetch("/api/depot-products").then((r) => r.json()),
    ]);
    setSimpraProducts(sp);
    setDepotProducts(dp);
    if (selected) {
      const updated = sp.find((p: SimpraProduct) => p.id === selected.id);
      setSelected(updated || null);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!newDepotName.trim()) { setSuggestions([]); return; }
    const q = newDepotName.toLowerCase();
    setSuggestions(depotProducts.filter((d) => d.name.toLowerCase().includes(q)).slice(0, 6));
  }, [newDepotName, depotProducts]);

  const isAlcohol = (p: SimpraProduct) =>
    p.category?.toLowerCase().includes("alkol") || p.category?.toLowerCase().includes("şarap");

  const filtered = simpraProducts.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = !filterNoRecipe || p.recipes.length === 0;
    const matchAlcohol = !filterAlcohol || isAlcohol(p);
    return matchSearch && matchFilter && matchAlcohol;
  });

  const noRecipeCount = simpraProducts.filter((p) => p.recipes.length === 0 && isAlcohol(p)).length;
  const withRecipeCount = simpraProducts.filter((p) => p.recipes.length > 0 && isAlcohol(p)).length;
  const alcoholCount = simpraProducts.filter((p) => isAlcohol(p)).length;

  const addRecipe = async () => {
    if (!selected || !newDepotName.trim() || !newCl) return;
    setSaving(true);
    const dpRes = await fetch("/api/depot-products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newDepotName.trim() }),
    });
    const dp = await dpRes.json();
    await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ simpraProductId: selected.id, depotProductId: dp.id, clAmount: parseFloat(newCl) }),
    });
    setNewDepotName(""); setNewCl(""); setShowSug(false);
    await load();
    setSaving(false);
  };

  const deleteRecipe = async (id: number) => {
    await fetch("/api/recipes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    await load();
  };

  const totalClPerServing = selected ? selected.recipes.reduce((s, r) => s + r.clAmount, 0) : 0;

  return (
    <div>
      {/* Üst bilgi bandı */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4 text-sm">
        <p className="text-amber-400 font-semibold mb-1">Bu sayfa ne işe yarar?</p>
        <p className="text-gray-400">
          Her Simpra ürünü için <span className="text-white">bir serviste kaç CL alkol kullanıldığını</span> tanımlarsın.{" "}
          <span className="text-gray-500">Bu ayar bir kez yapılır, haftalık değişmez.</span>{" "}
          Haftalık hesap için: <span className="text-white">Simpra İçe Aktar → Dönemler → Rapor</span> adımlarını kullan.
        </p>
        <div className="flex gap-4 mt-2 text-xs text-gray-500">
          <span>Toplam alkol ürünü: <strong className="text-white">{alcoholCount}</strong></span>
          <span>Reçete girildi: <strong className="text-green-400">{withRecipeCount}</strong></span>
          <span>Eksik: <strong className="text-yellow-400">{noRecipeCount}</strong></span>
        </div>
      </div>

      <div className="flex gap-4" style={{ height: "calc(100vh - 220px)" }}>
        {/* Sol panel */}
        <div className="w-80 flex flex-col bg-gray-900 rounded-lg border border-gray-800">
          <div className="p-3 border-b border-gray-800 space-y-2">
            <input
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white"
              placeholder="Ürün ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex flex-col gap-1 text-xs text-gray-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={filterAlcohol} onChange={(e) => setFilterAlcohol(e.target.checked)} className="accent-amber-500" />
                Sadece alkol ürünleri
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={filterNoRecipe} onChange={(e) => setFilterNoRecipe(e.target.checked)} className="accent-amber-500" />
                Reçetesiz olanları göster
              </label>
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className={`w-full text-left px-3 py-2.5 border-b border-gray-800/50 text-sm hover:bg-gray-800 transition-colors ${selected?.id === p.id ? "bg-gray-800 border-l-2 border-l-amber-500" : ""}`}
              >
                <div className="font-medium text-white truncate">{p.name}</div>
                <div className="text-xs text-gray-500 truncate">{p.category}</div>
                {p.recipes.length > 0 ? (
                  <div className="text-xs text-green-400 mt-0.5 truncate">
                    {p.recipes.map((r) => `${r.depotProduct.name} ${r.clAmount}cl`).join(" + ")}
                  </div>
                ) : (
                  <div className="text-xs text-gray-600 mt-0.5">Reçete girilmedi</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sağ panel */}
        <div className="flex-1 bg-gray-900 rounded-lg border border-gray-800 flex flex-col overflow-hidden">
          {!selected ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
              <span className="text-4xl">←</span>
              <p>Soldaki listeden bir ürün seç</p>
            </div>
          ) : (
            <>
              <div className="p-5 border-b border-gray-800">
                <h2 className="font-bold text-xl text-white">{selected.name}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{selected.category}</p>
                {totalClPerServing > 0 && (
                  <div className="mt-3 inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-1.5 text-sm">
                    <span className="text-gray-400">Servis başına:</span>
                    <span className="text-amber-400 font-bold">{totalClPerServing} cl</span>
                    <span className="text-gray-500">({(totalClPerServing / 100).toFixed(3)} lt)</span>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {selected.recipes.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tanımlanan Malzemeler</h3>
                    <div className="space-y-2">
                      {selected.recipes.map((r) => (
                        <div key={r.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                          <div>
                            <span className="font-medium text-white">{r.depotProduct.name}</span>
                            <span className="text-xs text-gray-500 ml-2">depo alkolü</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-amber-400 font-bold text-lg">{r.clAmount} <span className="text-sm font-normal text-gray-400">cl/servis</span></span>
                            <button onClick={() => deleteRecipe(r.id)} className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-900/20">Kaldır</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    {selected.recipes.length === 0 ? "Bu ürün için alkol tanımla" : "Malzeme Ekle"}
                  </h3>

                  {selected.recipes.length === 0 && (
                    <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-3 mb-4 text-xs text-gray-400 space-y-1">
                      <p><span className="text-amber-400 font-medium">KDH / Shot:</span> Tek alkol adı yaz → CL gir (örn: Beefeater Gin, 5 cl)</p>
                      <p><span className="text-amber-400 font-medium">Şişe:</span> Aynı alkol → şişe hacmi (örn: Beefeater Gin, 70 cl)</p>
                      <p><span className="text-amber-400 font-medium">Kokteyl:</span> Her alkolü ayrı ayrı ekle, toplamı otomatik hesaplanır</p>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap relative">
                    <div className="flex-1 min-w-48 relative">
                      <input
                        ref={inputRef}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-amber-500 outline-none"
                        placeholder="Alkol adı (örn: Beefeater Gin)"
                        value={newDepotName}
                        onChange={(e) => { setNewDepotName(e.target.value); setShowSug(true); }}
                        onFocus={() => setShowSug(true)}
                        onBlur={() => setTimeout(() => setShowSug(false), 150)}
                        onKeyDown={(e) => e.key === "Enter" && addRecipe()}
                      />
                      {showSug && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 overflow-hidden">
                          {suggestions.map((s) => (
                            <button key={s.id} className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 border-b border-gray-700/50 last:border-0" onMouseDown={() => { setNewDepotName(s.name); setShowSug(false); }}>
                              {s.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm w-28 focus:border-amber-500 outline-none"
                        placeholder="CL miktarı"
                        value={newCl}
                        onChange={(e) => setNewCl(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addRecipe()}
                      />
                    </div>
                    <button
                      onClick={addRecipe}
                      disabled={saving || !newDepotName.trim() || !newCl}
                      className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold px-5 py-2.5 rounded-lg text-sm disabled:opacity-40 transition-colors"
                    >
                      {saving ? "..." : "+ Ekle"}
                    </button>
                  </div>
                  {newDepotName.trim() && !depotProducts.find((d) => d.name.toLowerCase() === newDepotName.trim().toLowerCase()) && (
                    <p className="text-xs text-blue-400 mt-2">✦ &quot;{newDepotName.trim()}&quot; yeni depo ürünü olarak otomatik eklenecek</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
