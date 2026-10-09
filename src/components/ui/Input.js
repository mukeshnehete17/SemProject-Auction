export default function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  error,
  icon: Icon,
  required = false,
  disabled = false,
  className = "",
  id,
  step,
  min,
  max,
}) {
  const inputId = id || name;

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5"
        >
          {label}
          {required && <span className="text-rose-500 ml-1 font-normal">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          step={step}
          min={min}
          max={max}
          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 bg-white focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 focus:outline-none transition-colors disabled:bg-zinc-100 disabled:text-zinc-500 disabled:cursor-not-allowed shadow-2xs ${
            Icon ? "pl-10" : ""
          } ${error ? "border-rose-400 focus:border-rose-600 focus:ring-rose-500" : "border-zinc-300"}`}
        />
      </div>
      {error && <p className="text-rose-600 text-xs mt-1.5 font-medium">{error}</p>}
    </div>
  );
}
