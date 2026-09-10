const statusStyles = {
  active: 'bg-green-50 text-green-700',
  ending_soon: 'bg-amber-50 text-amber-700',
  ended: 'bg-red-50 text-red-700',
  upcoming: 'bg-blue-50 text-blue-700',
  cancelled: 'bg-gray-100 text-gray-600',
  winning: 'bg-green-50 text-green-700',
  outbid: 'bg-red-50 text-red-700',
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
  suspended: 'bg-red-50 text-red-700',
  active_user: 'bg-green-50 text-green-700',
  inactive_user: 'bg-gray-50 text-gray-700',
  payment_pending: 'bg-amber-50 text-amber-700',
  completed: 'bg-green-50 text-green-700',
};

const dotStyles = {
  active: 'bg-green-500',
  ending_soon: 'bg-amber-500',
  ended: 'bg-red-500',
  upcoming: 'bg-blue-500',
  cancelled: 'bg-gray-400',
  winning: 'bg-green-500',
  outbid: 'bg-red-500',
  pending: 'bg-amber-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  suspended: 'bg-red-500',
  active_user: 'bg-green-500',
  inactive_user: 'bg-gray-500',
  payment_pending: 'bg-amber-500',
  completed: 'bg-green-500',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

const statusLabels = {
  active: 'Active',
  ending_soon: 'Ending Soon',
  ended: 'Ended',
  upcoming: 'Upcoming',
  cancelled: 'Cancelled',
  winning: 'Winning',
  outbid: 'Outbid',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  suspended: 'Suspended',
  active_user: 'Active',
  inactive_user: 'Inactive',
  payment_pending: 'Payment Pending',
  completed: 'Completed',
};

export default function StatusBadge({ status, size = 'sm' }) {
  const colorClasses = statusStyles[status] || 'bg-gray-50 text-gray-700';
  const dotColor = dotStyles[status] || 'bg-gray-500';
  const sizeClass = sizeStyles[size] || sizeStyles.sm;
  const label = statusLabels[status] || status;

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium gap-1.5 ${colorClasses} ${sizeClass} ring-1 ring-inset ring-current/10`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
}
