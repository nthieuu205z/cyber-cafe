// Định dạng tiền VND: 12000 -> "12.000 ₫"
export function vnd(n: number | string | null | undefined): string {
  const v = Number(n ?? 0);
  return v.toLocaleString("vi-VN") + " ₫";
}

// Số giờ đẹp: 1.5 -> "1h 30m"
export function hoursLabel(h: number | null | undefined): string {
  const total = Number(h ?? 0);
  const hh = Math.floor(total);
  const mm = Math.round((total - hh) * 60);
  return `${hh}h ${mm}m`;
}

export function dateTime(s: string | null | undefined): string {
  if (!s) return "—";
  return new Date(s).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function dateOnly(s: string | null | undefined): string {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("vi-VN");
}
