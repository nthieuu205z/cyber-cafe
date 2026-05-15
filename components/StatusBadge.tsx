import type { MachineStatus } from "@/lib/types";

const MAP: Record<MachineStatus, { label: string; cls: string }> = {
  available: { label: "Trống", cls: "bg-slate-500/15 text-slate-300" },
  in_use: { label: "Đang dùng", cls: "bg-green-500/15 text-green-400" },
  maintenance: { label: "Bảo trì", cls: "bg-amber-500/15 text-amber-400" },
  error: { label: "Lỗi", cls: "bg-red-500/15 text-red-400" },
};

export default function StatusBadge({ status }: { status: MachineStatus }) {
  const s = MAP[status];
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
      {s.label}
    </span>
  );
}
