import { Plus, Play, Square, Trash2, Wrench } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { vnd } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import { SessionTimer } from "@/components/SessionTimer";
import {
  startSession,
  endSession,
  createMachine,
  deleteMachine,
  updateMachineStatus,
} from "@/lib/actions";
import type { MachineStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function MachinesPage() {
  const me = await requireUser(["admin", "operator"]);
  const isAdmin = me.role === "admin";

  const machines = await query<{
    id: string;
    name: string;
    status: MachineStatus;
    price_per_hour: string;
    specs: string | null;
    session_id: string | null;
    started_at: string | null;
    customer: string | null;
  }>(
    `select m.*, s.id as session_id, s.started_at,
            u.username as customer
     from machines m
     left join sessions s on s.machine_id = m.id and s.ended_at is null
     left join users u on u.id = s.user_id
     order by m.name`
  );

  const customers = await query<{ id: string; username: string }>(
    "select id, username from users where role = 'customer' and is_active = true order by username"
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🖥️ Quản lý máy trạm</h1>
        {isAdmin && (
          <details className="relative">
            <summary className="btn btn-primary list-none">
              <Plus className="h-4 w-4" /> Thêm máy
            </summary>
            <form
              action={createMachine}
              className="card absolute right-0 z-10 mt-2 flex w-64 flex-col gap-3 p-4"
            >
              <input name="name" required placeholder="Tên máy (PC-09)" className="input" />
              <input
                name="price_per_hour"
                type="number"
                required
                placeholder="Giá/giờ (12000)"
                className="input"
              />
              <input name="specs" placeholder="Cấu hình" className="input" />
              <button className="btn btn-primary">Lưu</button>
            </form>
          </details>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {machines.map((m) => (
          <div key={m.id} className="card flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold">{m.name}</p>
                <p className="text-xs text-muted">{m.specs}</p>
              </div>
              <StatusBadge status={m.status} />
            </div>
            <p className="text-sm text-amber-400">{vnd(m.price_per_hour)}/giờ</p>

            {m.status === "in_use" && m.started_at && (
              <>
                <p className="text-xs text-muted">
                  Khách: {m.customer ?? "Vãng lai"}
                </p>
                <SessionTimer
                  startedAt={m.started_at}
                  pricePerHour={Number(m.price_per_hour)}
                />
                <details>
                  <summary className="btn btn-ghost list-none w-full">
                    <Square className="h-4 w-4" /> Kết thúc & thanh toán
                  </summary>
                  <form action={endSession} className="mt-2 flex flex-col gap-2">
                    <input type="hidden" name="session_id" value={m.session_id!} />
                    <select name="payment_method" className="input">
                      <option value="cash">Tiền mặt</option>
                      <option value="balance">Trừ số dư tài khoản</option>
                      <option value="transfer">Chuyển khoản</option>
                    </select>
                    <button className="btn btn-primary">Xác nhận thanh toán</button>
                  </form>
                </details>
              </>
            )}

            {m.status === "available" && (
              <details>
                <summary className="btn btn-primary list-none w-full">
                  <Play className="h-4 w-4" /> Mở phiên
                </summary>
                <form action={startSession} className="mt-2 flex flex-col gap-2">
                  <input type="hidden" name="machine_id" value={m.id} />
                  <select name="user_id" className="input">
                    <option value="">Khách vãng lai</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.username}
                      </option>
                    ))}
                  </select>
                  <button className="btn btn-primary">Bắt đầu tính giờ</button>
                </form>
              </details>
            )}

            <div className="flex gap-2">
              {(m.status === "available" || m.status === "error" || m.status === "maintenance") && (
                <form action={updateMachineStatus} className="flex-1">
                  <input type="hidden" name="id" value={m.id} />
                  <input
                    type="hidden"
                    name="status"
                    value={m.status === "available" ? "maintenance" : "available"}
                  />
                  <button className="btn btn-ghost w-full text-xs">
                    <Wrench className="h-3 w-3" />
                    {m.status === "available" ? "Báo bảo trì/lỗi" : "Đánh dấu OK"}
                  </button>
                </form>
              )}
              {isAdmin && m.status !== "in_use" && (
                <form action={deleteMachine}>
                  <input type="hidden" name="id" value={m.id} />
                  <button className="btn btn-ghost text-xs text-red-400">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
