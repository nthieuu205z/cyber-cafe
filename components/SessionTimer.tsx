"use client";

import { useEffect, useState } from "react";

// Đồng hồ đếm giờ realtime cho phiên đang chạy.
export function SessionTimer({
  startedAt,
  pricePerHour,
}: {
  startedAt: string;
  pricePerHour?: number;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const ms = Math.max(0, now - new Date(startedAt).getTime());
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  const cost =
    pricePerHour != null
      ? Math.round((ms / 3_600_000) * pricePerHour)
      : null;

  return (
    <div className="mt-2 flex items-center justify-between">
      <span className="font-mono text-lg font-bold text-green-400">
        {pad(h)}:{pad(m)}:{pad(s)}
      </span>
      {cost != null && (
        <span className="text-sm text-amber-400">
          {cost.toLocaleString("vi-VN")} ₫
        </span>
      )}
    </div>
  );
}
