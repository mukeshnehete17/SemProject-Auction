import Link from "next/link";
import { Smartphone, Laptop, Camera, Gamepad2, Shirt, Gem } from "lucide-react";

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
  const IconComponent = iconMap[icon] || Smartphone;

  return (
    <Link
      href={`/auctions?category=${encodeURIComponent(name)}`}
      className="block"
    >
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer">
        <div className="flex justify-center mb-4">
          <IconComponent className="h-12 w-12 text-indigo-600" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">{name}</h3>
        <p className="text-xs text-gray-500">{count} items</p>
      </div>
    </Link>
  );
}
