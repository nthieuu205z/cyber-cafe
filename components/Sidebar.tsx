"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MonitorPlay,
  Clock,
  UtensilsCrossed,
  Receipt,
  Users,
  BarChart3,
  LogOut,
  Terminal,
} from "lucide-react";
import { logoutAction } from "@/lib/actions";
import type { Role } from "@/lib/types";

const ALL_LINKS = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard, roles: ["admin", "operator"] },
  { href: "/machines", label: "Máy trạm", icon: MonitorPlay, roles: ["admin", "operator"] },
  { href: "/sessions", label: "Phiên sử dụng", icon: Clock, roles: ["admin", "operator"] },
  { href: "/services", label: "Dịch vụ", icon: UtensilsCrossed, roles: ["admin", "operator"] },
  { href: "/invoices", label: "Hóa đơn", icon: Receipt, roles: ["admin", "operator"] },
  { href: "/users", label: "Người dùng", icon: Users, roles: ["admin"] },
  { href: "/reports", label: "Báo cáo", icon: BarChart3, roles: ["admin"] },
] as const;

export default function Sidebar({
  role,
  username,
}: {
  role: Role;
  username: string;
}) {
  const pathname = usePathname();
  const links = ALL_LINKS.filter((l) => l.roles.includes(role as never));

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border p-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
          <Terminal className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">Cyber Cafe</p>
          <p className="text-xs text-muted">Manager</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {links.map((l) => {
          const active = pathname === l.href;
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-accent text-white"
                  : "text-muted hover:bg-white/5 hover:text-text"
              }`}
            >
              <Icon className="h-4 w-4" />
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="mb-2 px-3 py-1">
          <p className="text-sm font-medium">{username}</p>
          <p className="text-xs text-muted capitalize">{role}</p>
        </div>
        <form action={logoutAction}>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-white/5 hover:text-red-400">
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </form>
      </div>
    </aside>
  );
}
