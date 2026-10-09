import Button from "./Button";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-white border border-zinc-200 flex items-center justify-center mb-4 shadow-2xs">
          <Icon className="h-6 w-6 text-zinc-400" />
        </div>
      )}
      {title && (
        <h3 className="text-base font-semibold text-zinc-900 tracking-tight mb-1.5">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-xs sm:text-sm text-zinc-500 mb-6 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
