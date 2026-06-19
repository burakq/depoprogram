import Link from "next/link";

const steps = [
  {
    step: "1",
    title: "Depo Ürünleri Tanımla",
    desc: "Deponda tuttuğun alkolleri ekle (Beefeater Gin, Hendricks, Grey Goose vb.)",
    href: "/urunler",
    color: "border-blue-500",
  },
  {
    step: "2",
    title: "Reçeteleri Gir",
    desc: "Her Simpra ürününe hangi depo alkolünden kaç CL kullanıldığını tanımla",
    href: "/receteler",
    color: "border-purple-500",
  },
  {
    step: "3",
    title: "Simpra Raporunu İçe Aktar",
    desc: "Simpra'dan indirdiğin xlsx dosyasını sisteme yükle",
    href: "/import",
    color: "border-amber-500",
  },
  {
    step: "4",
    title: "Dönem & Stok Girişi",
    desc: "Haftalık dönem oluştur, açılış stoğu ve gelen malzemeyi gir",
    href: "/donemler",
    color: "border-green-500",
  },
  {
    step: "5",
    title: "Rapor",
    desc: "Teorik tüketim ile bar sayımını karşılaştır — açık/fazla görüntüle",
    href: "/rapor",
    color: "border-red-500",
  },
];

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-amber-400 mb-2">Bar Stok Takip Sistemi</h1>
      <p className="text-gray-400 mb-8">
        Simpra satış raporu ile depo stoğunu karşılaştır, haftalık açık/fazla tespit et.
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((s) => (
          <Link
            key={s.step}
            href={s.href}
            className={`bg-gray-900 border-l-4 ${s.color} rounded-lg p-5 hover:bg-gray-800 transition-colors`}
          >
            <div className="text-xs text-gray-500 mb-1">Adım {s.step}</div>
            <div className="font-semibold text-white mb-1">{s.title}</div>
            <div className="text-sm text-gray-400">{s.desc}</div>
          </Link>
        ))}
      </div>

      <div className="mt-10 bg-gray-900 rounded-lg p-5 border border-gray-800">
        <h2 className="font-semibold text-amber-400 mb-2">Nasıl Çalışır?</h2>
        <div className="text-sm text-gray-300 space-y-1">
          <p>• Dönem başı stok + Gelen malzeme = Toplam mevcut</p>
          <p>• Satış adedi × Reçete CL = Teorik tüketim</p>
          <p>• Toplam mevcut − Teorik tüketim = Teorik kalan</p>
          <p>
            • Bar sayımı − Teorik kalan ={" "}
            <span className="text-red-400">Açık (fire)</span> /{" "}
            <span className="text-green-400">Fazla</span>
          </p>
        </div>
      </div>
    </div>
  );
}
