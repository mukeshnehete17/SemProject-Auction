const colorStyles = {
  indigo: 'bg-indigo-50 text-indigo-600',
  green: 'bg-green-50 text-green-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
  blue: 'bg-blue-50 text-blue-600',
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = 'indigo',
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
      <div className="flex items-center gap-4">
        {Icon && (
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              colorStyles[color] || colorStyles.indigo
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}
