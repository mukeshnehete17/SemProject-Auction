import { ChevronDown } from "lucide-react";

export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  required = false,
  disabled = false,
  className = "",
  id,
}) {
  const selectId = id || name;

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5"
        >
          {label}
          {required && <span className="text-rose-500 ml-1 font-normal">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`w-full rounded-lg border px-3.5 pr-10 py-2.5 text-sm text-zinc-900 bg-white focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 focus:outline-none transition-colors disabled:bg-zinc-100 disabled:text-zinc-500 disabled:cursor-not-allowed appearance-none cursor-pointer shadow-2xs ${
            error ? "border-rose-400 focus:border-rose-600 focus:ring-rose-500" : "border-zinc-300"
          }`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-400">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
      {error && <p className="text-rose-600 text-xs mt-1.5 font-medium">{error}</p>}
    </div>
  );
}
