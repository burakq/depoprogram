"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Özet" },
  { href: "/urunler", label: "Depo Ürünleri" },
  { href: "/receteler", label: "Reçeteler" },
  { href: "/import", label: "Simpra İçe Aktar" },
  { href: "/donemler", label: "Dönemler" },
  { href: "/rapor", label: "Rapor" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 flex items-center gap-1 h-14">
        <span className="text-amber-400 font-bold text-lg mr-4">🍸 Bar Stok</span>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              pathname === l.href
                ? "bg-amber-500 text-gray-900"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
