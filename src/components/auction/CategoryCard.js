import Link from "next/link";
import Image from "next/image";
import {
  Smartphone,
  Laptop,
  Camera,
  Gamepad2,
  Shirt,
  Gem,
  Package,
  Watch,
  Footprints,
  Palette,
} from "lucide-react";

const iconMap = {
  Smartphone,
  Laptop,
  Camera,
  Gamepad2,
  Shirt,
  Gem,
  Watch,
  Footprints,
  Palette,
};

export default function CategoryCard({ category }) {
  const { name, slug, icon, count, image } = category;
  const IconComponent = iconMap[icon] || Package;

  return (
    <Link
      href={`/auctions?category=${encodeURIComponent(slug || name)}`}
      className="group block relative rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-900/60 transition-all duration-500 hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-950/30 hover:-translate-y-1.5"
    >
      {/* Background Image Visual with Dark Gradient Overlay */}
      <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-zinc-950">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 12vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110 opacity-40 group-hover:opacity-60"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />

        {/* Icon Floating Badge */}
        <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-zinc-900/90 backdrop-blur-md border border-zinc-700/60 flex items-center justify-center text-zinc-300 group-hover:text-violet-400 group-hover:border-violet-500/40 transition-colors">
          <IconComponent className="h-4 w-4" />
        </div>
      </div>

      {/* Category Details */}
      <div className="p-4 relative bg-zinc-900/90 border-t border-zinc-800/60">
        <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-violet-300 transition-colors truncate">
          {name}
        </h3>
        <p className="mt-1 text-xs font-mono text-zinc-400 flex items-center justify-between">
          <span>{count} {count === 1 ? "lot" : "lots"}</span>
          <span className="text-[10px] uppercase text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity font-sans font-semibold">
            Explore &rarr;
          </span>
        </p>
      </div>
    </Link>
  );
}
