"use client";

import { useState, useEffect, useRef } from "react";
import {
  Package,
  Smartphone,
  Laptop,
  Camera,
  Gamepad2,
  Shirt,
  Gem,
  Monitor,
} from "lucide-react";

const categoryConfig = {
  Electronics: { Icon: Smartphone, label: "Precision Electronics", bg: "bg-zinc-100", darkBg: "bg-zinc-900", color: "text-zinc-500", darkColor: "text-indigo-400" },
  Computers: { Icon: Laptop, label: "Computing & Displays", bg: "bg-zinc-100", darkBg: "bg-zinc-900", color: "text-zinc-500", darkColor: "text-indigo-400" },
  Cameras: { Icon: Camera, label: "Optics & Photography", bg: "bg-zinc-100", darkBg: "bg-zinc-900", color: "text-zinc-500", darkColor: "text-indigo-400" },
  Gaming: { Icon: Gamepad2, label: "Gaming & Consoles", bg: "bg-zinc-100", darkBg: "bg-zinc-900", color: "text-zinc-500", darkColor: "text-indigo-400" },
  Fashion: { Icon: Shirt, label: "Apparel & Horology", bg: "bg-zinc-100", darkBg: "bg-zinc-900", color: "text-zinc-500", darkColor: "text-indigo-400" },
  Collectibles: { Icon: Gem, label: "Certified Collectibles", bg: "bg-zinc-100", darkBg: "bg-zinc-900", color: "text-zinc-500", darkColor: "text-indigo-400" },
};

const defaultConfig = { Icon: Package, label: "Verified Lot", bg: "bg-zinc-100", darkBg: "bg-zinc-900", color: "text-zinc-400", darkColor: "text-indigo-400" };

export default function ImageWithFallback({
  src,
  alt,
  category = "",
  className = "",
  imgClassName = "",
  tone = "light",
  priority = false,
  fill = false,
}) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);
  const dark = tone === "dark";

  // Check if image is already complete in DOM cache
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      if (imgRef.current.naturalWidth > 0) {
        setLoaded(true);
      } else if (imgRef.current.naturalWidth === 0 && src) {
        setError(true);
      }
    }
  }, [src]);

  const config = categoryConfig[category] || defaultConfig;
  const Icon = config.Icon;

  if (!src || error) {
    if (dark) {
      return (
        <div
          className={`bg-zinc-900 flex flex-col items-center justify-center gap-3 p-6 border border-white/5 relative overflow-hidden ${className}`}
        >
          {/* Subtle background ambient ring */}
          <div className="absolute inset-0 bg-radial from-indigo-500/10 via-transparent to-transparent opacity-50" />
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative z-10 shadow-lg shadow-black/40">
            <Icon className="h-7 w-7 text-indigo-400" />
          </div>
          <div className="text-center relative z-10 space-y-0.5">
            <p className="text-xs font-semibold text-zinc-200 tracking-tight line-clamp-1 max-w-[200px]">
              {alt || config.label}
            </p>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              {category || "Archival Lot"}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`${config.bg} flex flex-col items-center justify-center gap-3 p-6 border border-zinc-200/60 relative overflow-hidden ${className}`}
      >
        <div className="w-14 h-14 rounded-2xl bg-white border border-zinc-200/80 flex items-center justify-center shadow-xs">
          <Icon className={`h-7 w-7 ${config.color}`} />
        </div>
        <div className="text-center space-y-0.5">
          <p className="text-xs font-semibold text-zinc-800 tracking-tight line-clamp-1 max-w-[200px]">
            {alt || config.label}
          </p>
          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
            {category || "Archival Lot"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${dark ? "bg-zinc-900" : "bg-zinc-100"} ${className}`}
    >
      {/* Pulse placeholder until loaded */}
      {!loaded && !error && (
        <div
          className={`absolute inset-0 animate-pulse ${
            dark ? "bg-white/5" : "bg-zinc-200/70"
          }`}
        />
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt || "Auction lot image"}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        } ${imgClassName}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
      />
    </div>
  );
}
