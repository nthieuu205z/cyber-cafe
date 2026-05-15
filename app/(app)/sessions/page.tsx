import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { vnd, dateTime, hoursLabel } from "@/lib/format";
import { SessionTimer } from "@/components/SessionTimer";
import { addOrder } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  await requireUser(["admin", "operator"]);

  const running = await query<{
    id: string;
    machine: string;
    customer: string | null;
    started_at: string;
    price_per_hour: string;
    services: string;
    svc_total: string;
  }>(
    `select s.id, m.name as machine, u.username as customer, s.started_at,
            m.price_per_hour,
            coalesce(string_agg(sv.name || ' x' || o.quantity, ', '), '') as services,
            coalesce(sum(o.total_price), 0) as svc_total
     from sessions s
     join machines m on m.id = s.machine_id
     left join users u on u.id = s.user_id
     left join orders o on o.session_id = s.id
     left join services sv on sv.id = o.service_id
     where s.ended_at is null
     group by s.id, m.name, u.username, s.started_at, m.price_per_hour
     order by s.started_at`
  );

  const history = await query<{
    id: string;
    machine: string;
    customer: string | null;
    started_at: string;
    ended_at: string;
    total_hours: string;
    total_cost: string;
  }>(
    `select s.id, m.name as machine, u.username as customer,
            s.started_at, s.ended_at, s.total_hours, s.total_cost
     from sessions s
     join machines m on m.id = s.machine_id
     left join users u on u.id = s.user_id
     where s.ended_at is not null
     order by s.ended_at desc limit 50`
  );

  const services = await query<{ id: string; name: string; price: string }>(
    "select id, name, price from services where is_available = true order by name"
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">⏱️ Phiên sử dụng</h1>

      <section>
        <h2 className="mb-3 font-semibold">
          Đang chạy ({running.length})
        </h2>
        {running.length === 0 ? (
          <p className="text-sm text-muted">Chưa có phiên nào đang chạy.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {running.map((s) => (
              <div key={s.id} className="card flex flex-col gap-2 p-4">
                <div className="flex justify-between">
                  <p className="font-bold">{s.machine}</p>
                  <p className="text-xs text-muted">
                    {s.customer ?? "Khách vãng lai"}
                  </p>
                </div>
                <p className="text-xs text-muted">
                  Bắt đầu: {dateTime(s.started_at)}
                </p>
                <SessionTimer
                  startedAt={s.started_at}
                  pricePerHour={Number(s.price_per_hour)}
                />
                {s.services && (
                  <p className="text-xs text-muted">
                    Dịch vụ: {s.services} ({vnd(s.svc_total)})
                  </p>
                )}
                <details>
                  <summary className="btn btn-ghost list-none w-full text-xs">
                    + Thêm dịch vụ
                  </summary>
                  <form action={addOrder} className="mt-2 flex gap-2">
                    <input type="hidden" name="session_id" value={s.id} />
                    <select name="service_id" className="input" required>
                      {services.map((sv) => (
                        <option key={sv.id} value={sv.id}>
                          {sv.name} ({vnd(sv.price)})
                        </option>
                      ))}
                    </select>
                    <input
                      name="quantity"
                      type="number"
                      min={1}
                      defaultValue={1}
                      className="input w-16"
                    />
                    <button className="btn btn-primary">+</button>
                  </form>
                </details>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-semibold">Lịch sử (50 gần nhất)</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-muted">
              <tr>
                <th className="p-3">Máy</th>
                <th className="p-3">Khách</th>
                <th className="p-3">Bắt đầu</th>
                <th className="p-3">Kết thúc</th>
                <th className="p-3">Thời lượng</th>
                <th className="p-3 text-right">Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-b border-border/50">
                  <td className="p-3 font-medium">{h.machine}</td>
                  <td className="p-3">{h.customer ?? "Vãng lai"}</td>
                  <td className="p-3 text-muted">{dateTime(h.started_at)}</td>
                  <td className="p-3 text-muted">{dateTime(h.ended_at)}</td>
                  <td className="p-3">{hoursLabel(Number(h.total_hours))}</td>
                  <td className="p-3 text-right text-amber-400">
                    {vnd(h.total_cost)}
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-muted">
                    Chưa có lịch sử.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
