import Link from "next/link";

const variants = {
  primary:
    "bg-zinc-950 text-white hover:bg-zinc-800 active:bg-zinc-900 shadow-sm border border-transparent",
  accent:
    "bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 shadow-sm shadow-indigo-600/20 border border-transparent",
  secondary:
    "bg-zinc-100 text-zinc-900 hover:bg-zinc-200/80 active:bg-zinc-200 border border-transparent",
  outline:
    "border border-zinc-300 text-zinc-900 hover:bg-zinc-50 hover:border-zinc-400 active:bg-zinc-100",
  ghost:
    "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 active:bg-zinc-100/80 border border-transparent",
  ghostDark:
    "text-zinc-400 hover:text-white hover:bg-white/10 active:bg-white/15 border border-transparent",
  outlineDark:
    "border border-white/15 text-zinc-100 hover:bg-white/10 hover:border-white/25 active:bg-white/15",
  danger:
    "bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700 shadow-sm border border-transparent",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs font-medium tracking-wide",
  md: "px-4 py-2 text-xs sm:text-sm font-medium tracking-tight",
  lg: "px-6 py-2.5 text-sm font-semibold tracking-tight",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  type = "button",
  onClick,
  href,
}) {
  const selectedVariant = variants[variant] || variants.primary;
  const selectedSize = sizes[size] || sizes.md;
  const classes = `${baseClasses} ${selectedVariant} ${selectedSize} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={classes}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
