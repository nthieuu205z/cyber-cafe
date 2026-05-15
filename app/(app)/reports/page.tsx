import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { vnd } from "@/lib/format";
import RevenueChart from "@/components/RevenueChart";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  await requireUser(["admin"]);

  const [sum] = await query<{
    today: string;
    week: string;
    month: string;
  }>(
    `select
       coalesce(sum(total) filter (where paid_at::date = current_date),0) as today,
       coalesce(sum(total) filter (where paid_at >= current_date - interval '6 day'),0) as week,
       coalesce(sum(total) filter (where paid_at >= date_trunc('month', current_date)),0) as month
     from invoices`
  );

  const daily = await query<{ d: string; total: string }>(
    `select to_char(day, 'DD/MM') as d, coalesce(sum(i.total),0) as total
     from generate_series(current_date - interval '13 day', current_date, interval '1 day') as day
     left join invoices i on i.paid_at::date = day::date
     group by day order by day`
  );

  const topMachines = await query<{ name: string; n: string; revenue: string }>(
    `select m.name, count(s.id) as n, coalesce(sum(s.total_cost),0) as revenue
     from machines m
     left join sessions s on s.machine_id = m.id and s.ended_at is not null
     group by m.name order by revenue desc limit 8`
  );

  const topServices = await query<{ name: string; qty: string; revenue: string }>(
    `select sv.name, coalesce(sum(o.quantity),0) as qty,
            coalesce(sum(o.total_price),0) as revenue
     from services sv
     left join orders o on o.service_id = sv.id
     group by sv.name order by revenue desc limit 8`
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">📈 Báo cáo doanh thu</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Hôm nay", value: sum.today },
          { label: "7 ngày qua", value: sum.week },
          { label: "Tháng này", value: sum.month },
        ].map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-sm text-muted">{c.label}</p>
            <p className="mt-1 text-2xl font-bold text-amber-400">
              {vnd(c.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="mb-4 font-semibold">Doanh thu 14 ngày gần nhất</h2>
        <RevenueChart
          data={daily.map((r) => ({ d: r.d, total: Number(r.total) }))}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-4 font-semibold">Top máy doanh thu cao</h2>
          <table className="w-full text-sm">
            <thead className="text-left text-muted">
              <tr>
                <th className="pb-2">Máy</th>
                <th className="pb-2 text-center">Lượt</th>
                <th className="pb-2 text-right">Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {topMachines.map((m) => (
                <tr key={m.name} className="border-t border-border/50">
                  <td className="py-2 font-medium">{m.name}</td>
                  <td className="py-2 text-center text-muted">{m.n}</td>
                  <td className="py-2 text-right text-amber-400">
                    {vnd(m.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 font-semibold">Top dịch vụ bán chạy</h2>
          <table className="w-full text-sm">
            <thead className="text-left text-muted">
              <tr>
                <th className="pb-2">Dịch vụ</th>
                <th className="pb-2 text-center">SL</th>
                <th className="pb-2 text-right">Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {topServices.map((s) => (
                <tr key={s.name} className="border-t border-border/50">
                  <td className="py-2 font-medium">{s.name}</td>
                  <td className="py-2 text-center text-muted">{s.qty}</td>
                  <td className="py-2 text-right text-amber-400">
                    {vnd(s.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
