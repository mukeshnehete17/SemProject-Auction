"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

function calcDiff(target) {
  const diff = Math.max(0, target - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, total: diff };
}

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function CountdownTimer({ startTime, endTime, status, className = "" }) {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (status === "ended" || status === "cancelled") return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [status]);

  if (status === "cancelled") {
    return (
      <span className={`inline-flex items-center gap-1.5 text-gray-500 ${className}`}>
        <Clock className="h-3.5 w-3.5" />
        Cancelled
      </span>
    );
  }

  if (status === "ended") {
    return (
      <span className={`inline-flex items-center gap-1.5 text-red-600 font-medium ${className}`}>
        <Clock className="h-3.5 w-3.5" />
        Ended
      </span>
    );
  }

  const startMs = new Date(startTime).getTime();
  const endMs = new Date(endTime).getTime();

  if (now < startMs) {
    const d = calcDiff(startMs);
    return (
      <span className={`inline-flex items-center gap-1.5 text-blue-600 ${className}`}>
        <Clock className="h-3.5 w-3.5" />
        {d.days > 0 && <span>{d.days}d</span>}
        <span className="font-mono font-semibold tabular-nums">
          {pad(d.hours)}:{pad(d.minutes)}:{pad(d.seconds)}
        </span>
        to start
      </span>
    );
  }

  const d = calcDiff(endMs);
  if (d.total === 0) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-red-600 font-medium ${className}`}>
        <Clock className="h-3.5 w-3.5" />
        Ended
      </span>
    );
  }

  const isUrgent = d.total < 3600000;

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${
        isUrgent ? "text-red-600" : "text-gray-700"
      } ${className}`}
    >
      <Clock className="h-3.5 w-3.5" />
      {d.days > 0 && <span>{d.days}d</span>}
      <span className={`font-mono font-semibold tabular-nums ${isUrgent ? "animate-pulse" : ""}`}>
        {pad(d.hours)}:{pad(d.minutes)}:{pad(d.seconds)}
      </span>
      <span className="text-xs">left</span>
    </span>
  );
}