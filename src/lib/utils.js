export function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatPriceCompact(price) {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(1)}Cr`;
  }
  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(1)}L`;
  }
  if (price >= 1000) {
    return `₹${(price / 1000).toFixed(1)}K`;
  }
  return formatPrice(price);
}

export function getStatusColor(status) {
  const colors = {
    active: 'text-green-600 bg-green-50',
    ending_soon: 'text-amber-600 bg-amber-50',
    ended: 'text-red-600 bg-red-50',
    upcoming: 'text-blue-600 bg-blue-50',
    cancelled: 'text-gray-500 bg-gray-100',
  };
  return colors[status] || 'text-gray-600 bg-gray-50';
}

export function getStatusText(status) {
  const texts = {
    active: 'Active',
    ending_soon: 'Ending Soon',
    ended: 'Ended',
    upcoming: 'Upcoming',
    cancelled: 'Cancelled',
  };
  return texts[status] || status;
}

export function formatDateTime(date) {
  if (!date) return '—';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}

export function formatTimeRemaining(status, startTime, endTime) {
  if (status === 'cancelled') return 'Cancelled';
  if (status === 'ended') return 'Ended';

  const now = Date.now();
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return getStatusText(status);

  const target = status === 'upcoming' ? start : end;
  const diff = Math.max(0, target - now);

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

  if (status === 'upcoming') {
    if (days > 0) return `Starts in ${days}d ${hours}h`;
    if (hours > 0) return `Starts in ${hours}h ${minutes}m`;
    if (minutes > 0) return `Starts in ${minutes}m`;
    return 'Starting soon';
  }

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  if (minutes > 0) return `${minutes}m left`;
  return 'Ending any moment';
}

export function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}
