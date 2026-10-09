const statusStyles = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  ending_soon: "bg-amber-50 text-amber-800 border-amber-200/80",
  ended: "bg-zinc-100 text-zinc-600 border-zinc-200",
  upcoming: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
  cancelled: "bg-zinc-100 text-zinc-500 border-zinc-200",
  winning: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  outbid: "bg-rose-50 text-rose-700 border-rose-200/80",
  pending: "bg-amber-50 text-amber-800 border-amber-200/80",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  rejected: "bg-rose-50 text-rose-700 border-rose-200/80",
  suspended: "bg-rose-50 text-rose-700 border-rose-200/80",
  active_user: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  inactive_user: "bg-zinc-100 text-zinc-600 border-zinc-200",
  payment_pending: "bg-amber-50 text-amber-800 border-amber-200/80",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
};

const dotStyles = {
  active: "bg-emerald-500 animate-pulse",
  ending_soon: "bg-amber-500 animate-ping",
  ended: "bg-zinc-400",
  upcoming: "bg-indigo-500",
  cancelled: "bg-zinc-400",
  winning: "bg-emerald-500",
  outbid: "bg-rose-500",
  pending: "bg-amber-500",
  approved: "bg-emerald-500",
  rejected: "bg-rose-500",
  suspended: "bg-rose-500",
  active_user: "bg-emerald-500",
  inactive_user: "bg-zinc-400",
  payment_pending: "bg-amber-500",
  completed: "bg-emerald-500",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-[10px] tracking-wider uppercase font-semibold",
  md: "px-2.5 py-1 text-xs tracking-wide uppercase font-semibold",
};

const statusLabels = {
  active: "Live Now",
  ending_soon: "Ending Soon",
  ended: "Ended",
  upcoming: "Upcoming",
  cancelled: "Cancelled",
  winning: "Winning",
  outbid: "Outbid",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
  active_user: "Active",
  inactive_user: "Inactive",
  payment_pending: "Payment Pending",
  completed: "Completed",
};

export default function StatusBadge({ status, size = "sm" }) {
  const colorClasses = statusStyles[status] || "bg-zinc-50 text-zinc-700 border-zinc-200";
  const dotColor = dotStyles[status] || "bg-zinc-400";
  const sizeClass = sizeStyles[size] || sizeStyles.sm;
  const label = statusLabels[status] || status;

  return (
    <span
      className={`inline-flex items-center rounded-full border ${colorClasses} ${sizeClass} gap-1.5 shadow-2xs`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{label}</span>
    </span>
  );
}
