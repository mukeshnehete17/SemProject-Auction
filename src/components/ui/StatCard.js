const colorStyles = {
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
  green: "bg-emerald-50 text-emerald-700 border-emerald-100",
  amber: "bg-amber-50 text-amber-800 border-amber-100",
  red: "bg-rose-50 text-rose-700 border-rose-100",
  blue: "bg-blue-50 text-blue-700 border-blue-100",
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = "indigo",
}) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200/90 p-5 sm:p-6 transition-all duration-200 hover:border-zinc-300 hover:shadow-xs">
      <div className="flex items-center gap-4">
        {Icon && (
          <div
            className={`w-11 h-11 rounded-lg border flex items-center justify-center shrink-0 ${
              colorStyles[color] || colorStyles.indigo
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider truncate mb-1">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight tabular-nums">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
