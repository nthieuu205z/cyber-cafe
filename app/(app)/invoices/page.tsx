import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { vnd, dateTime } from "@/lib/format";
import PrintInvoiceButton from "@/components/PrintInvoiceButton";

export const dynamic = "force-dynamic";

const PM: Record<string, string> = {
  cash: "Tiền mặt",
  balance: "Trừ số dư",
  transfer: "Chuyển khoản",
};

export default async function InvoicesPage() {
  await requireUser(["admin", "operator"]);

  const invoices = await query<{
    id: string;
    machine: string;
    customer: string | null;
    session_cost: string;
    service_cost: string;
    total: string;
    payment_method: string;
    paid_at: string;
  }>(
    `select i.id, m.name as machine, u.username as customer,
            i.session_cost, i.service_cost, i.total,
            i.payment_method, i.paid_at
     from invoices i
     join sessions s on s.id = i.session_id
     join machines m on m.id = s.machine_id
     left join users u on u.id = i.user_id
     order by i.paid_at desc limit 100`
  );

  const totalSum = invoices.reduce((a, b) => a + Number(b.total), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🧾 Hóa đơn</h1>
        <p className="text-sm text-muted">
          Tổng {invoices.length} hóa đơn ·{" "}
          <span className="text-amber-400">{vnd(totalSum)}</span>
        </p>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted">
            <tr>
              <th className="p-3">Mã</th>
              <th className="p-3">Máy</th>
              <th className="p-3">Khách</th>
              <th className="p-3 text-right">Tiền giờ</th>
              <th className="p-3 text-right">Dịch vụ</th>
              <th className="p-3 text-right">Tổng</th>
              <th className="p-3">Thanh toán</th>
              <th className="p-3">Thời gian</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((i) => (
              <tr key={i.id} className="border-b border-border/50">
                <td className="p-3 font-mono text-xs">{i.id.slice(0, 8)}</td>
                <td className="p-3 font-medium">{i.machine}</td>
                <td className="p-3">{i.customer ?? "Vãng lai"}</td>
                <td className="p-3 text-right text-muted">
                  {vnd(i.session_cost)}
                </td>
                <td className="p-3 text-right text-muted">
                  {vnd(i.service_cost)}
                </td>
                <td className="p-3 text-right text-amber-400">
                  {vnd(i.total)}
                </td>
                <td className="p-3">{PM[i.payment_method] ?? i.payment_method}</td>
                <td className="p-3 text-muted">{dateTime(i.paid_at)}</td>
                <td className="p-3">
                  <PrintInvoiceButton
                    inv={{
                      id: i.id,
                      machine: i.machine,
                      customer: i.customer,
                      session_cost: Number(i.session_cost),
                      service_cost: Number(i.service_cost),
                      total: Number(i.total),
                      payment_method: i.payment_method,
                      paid_at: i.paid_at,
                    }}
                  />
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={9} className="p-4 text-center text-muted">
                  Chưa có hóa đơn nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
