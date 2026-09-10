"use client";

import { useState } from "react";
import {
  Package,
  Smartphone,
  Laptop,
  Camera,
  Gamepad2,
  Shirt,
  Gem,
} from "lucide-react";

const categoryConfig = {
  Electronics: { Icon: Smartphone, bg: "bg-blue-50", color: "text-blue-400" },
  Computers: { Icon: Laptop, bg: "bg-violet-50", color: "text-violet-400" },
  Cameras: { Icon: Camera, bg: "bg-amber-50", color: "text-amber-400" },
  Gaming: { Icon: Gamepad2, bg: "bg-emerald-50", color: "text-emerald-400" },
  Fashion: { Icon: Shirt, bg: "bg-pink-50", color: "text-pink-400" },
  Collectibles: { Icon: Gem, bg: "bg-orange-50", color: "text-orange-400" },
};

const defaultConfig = { Icon: Package, bg: "bg-gray-50", color: "text-gray-400" };

export default function ImageWithFallback({
  src,
  alt,
  category = "",
  className = "",
  imgClassName = "",
}) {
  const [error, setError] = useState(false);

  if (!src || error) {
    const { Icon, bg, color } = categoryConfig[category] || defaultConfig;
    return (
      <div className={`${bg} flex flex-col items-center justify-center gap-2 ${className}`}>
        <Icon className={`h-10 w-10 ${color}`} />
        <span className={`text-xs font-medium ${color} opacity-60`}>{alt || category || "Product"}</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-gray-50 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${imgClassName}`}
        onError={() => setError(true)}
        loading="lazy"
      />
    </div>
  );
}
