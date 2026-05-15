import {
  MonitorPlay,
  Activity,
  CircleSlash,
  Wallet,
  Users as UsersIcon,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { vnd, dateTime } from "@/lib/format";
import RevenueChart from "@/components/RevenueChart";
import { SessionTimer } from "@/components/SessionTimer";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await requireUser(["admin", "operator"]);

  const [machineStats] = await query<{
    total: string;
    in_use: string;
    available: string;
    error: string;
  }>(
    `select
       count(*) as total,
       count(*) filter (where status='in_use') as in_use,
       count(*) filter (where status='available') as available,
       count(*) filter (where status in ('error','maintenance')) as error
     from machines`
  );

  const [revenue] = await query<{ today: string }>(
    `select coalesce(sum(total),0) as today from invoices
     where paid_at::date = current_date`
  );

  const [active] = await query<{ n: string }>(
    "select count(*) as n from sessions where ended_at is null"
  );

  const topServices = await query<{ name: string; qty: string }>(
    `select s.name, coalesce(sum(o.quantity),0) as qty
     from services s left join orders o on o.service_id = s.id
     group by s.name order by qty desc limit 5`
  );

  const last7 = await query<{ d: string; total: string }>(
    `select to_char(day, 'DD/MM') as d, coalesce(sum(i.total),0) as total
     from generate_series(current_date - interval '6 day', current_date, interval '1 day') as day
     left join invoices i on i.paid_at::date = day::date
     group by day order by day`
  );

  const activeSessions = await query<{
    id: string;
    machine: string;
    username: string | null;
    started_at: string;
  }>(
    `select s.id, m.name as machine, u.username, s.started_at
     from sessions s
     join machines m on m.id = s.machine_id
     left join users u on u.id = s.user_id
     where s.ended_at is null order by s.started_at`
  );

  const cards = [
    { label: "Tổng máy", value: machineStats.total, icon: MonitorPlay, color: "text-accent" },
    { label: "Đang dùng", value: machineStats.in_use, icon: Activity, color: "text-green-400" },
    { label: "Máy trống", value: machineStats.available, icon: MonitorPlay, color: "text-slate-400" },
    { label: "Lỗi / bảo trì", value: machineStats.error, icon: CircleSlash, color: "text-red-400" },
    { label: "Doanh thu hôm nay", value: vnd(revenue.today), icon: Wallet, color: "text-amber-400" },
    { label: "Khách đang chơi", value: active.n, icon: UsersIcon, color: "text-indigo-400" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">📊 Tổng quan</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="card p-4">
              <Icon className={`mb-2 h-5 w-5 ${c.color}`} />
              <p className="text-xl font-bold">{c.value}</p>
              <p className="text-xs text-muted">{c.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-4 font-semibold">Doanh thu 7 ngày gần nhất</h2>
          <RevenueChart data={last7.map((r) => ({ d: r.d, total: Number(r.total) }))} />
        </div>

        <div className="card p-5">
          <h2 className="mb-4 font-semibold">Top dịch vụ bán chạy</h2>
          <ul className="flex flex-col gap-3">
            {topServices.map((s, i) => (
              <li key={s.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 text-xs text-accent">
                    {i + 1}
                  </span>
                  {s.name}
                </span>
                <span className="text-muted">{s.qty} lượt</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-4 font-semibold">Phiên đang hoạt động ({activeSessions.length})</h2>
        {activeSessions.length === 0 ? (
          <p className="text-sm text-muted">Không có phiên nào đang chạy.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeSessions.map((s) => (
              <div key={s.id} className="rounded-lg border border-border bg-bg p-3">
                <p className="font-medium">{s.machine}</p>
                <p className="text-xs text-muted">
                  Khách: {s.username ?? "Vãng lai"} · Bắt đầu {dateTime(s.started_at)}
                </p>
                <SessionTimer startedAt={s.started_at} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
