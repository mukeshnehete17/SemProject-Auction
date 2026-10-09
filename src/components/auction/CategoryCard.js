import Link from "next/link";
import { Smartphone, Laptop, Camera, Gamepad2, Shirt, Gem, Package } from "lucide-react";

const iconMap = {
  Smartphone,
  Laptop,
  Camera,
  Gamepad2,
  Shirt,
  Gem,
};

export default function CategoryCard({ category }) {
  const { name, icon, count } = category;
  const IconComponent = iconMap[icon] || Package;

  return (
    <Link
      href={`/auctions?category=${encodeURIComponent(name)}`}
      className="block group"
    >
      <div className="bg-white rounded-xl border border-zinc-200/90 p-5 text-center transition-all duration-300 hover:border-zinc-900 hover:shadow-lg hover:-translate-y-1">
        <div className="w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mx-auto mb-3.5 group-hover:bg-zinc-950 group-hover:text-white transition-all duration-300">
          <IconComponent className="h-5 w-5 text-zinc-700 group-hover:text-white transition-colors" />
        </div>
        <h3 className="text-xs sm:text-sm font-bold text-zinc-900 mb-1 tracking-tight">
          {name}
        </h3>
        <p className="text-[11px] font-mono text-zinc-400">
          {count} {count === 1 ? "lot" : "lots"}
        </p>
      </div>
    </Link>
  );
}
