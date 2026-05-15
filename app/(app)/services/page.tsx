import { Plus, Trash2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { vnd } from "@/lib/format";
import {
  createService,
  toggleService,
  deleteService,
} from "@/lib/actions";
import type { ServiceCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

const CAT_LABEL: Record<ServiceCategory, string> = {
  food: "🍜 Đồ ăn",
  drink: "🥤 Nước uống",
  other: "📦 Khác",
};

export default async function ServicesPage() {
  const me = await requireUser(["admin", "operator"]);
  const isAdmin = me.role === "admin";

  const services = await query<{
    id: string;
    name: string;
    price: string;
    category: ServiceCategory;
    is_available: boolean;
  }>("select * from services order by category, name");

  const grouped: Record<string, typeof services> = {};
  for (const s of services) (grouped[s.category] ??= []).push(s);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🍜 Dịch vụ</h1>
        {isAdmin && (
          <details className="relative">
            <summary className="btn btn-primary list-none">
              <Plus className="h-4 w-4" /> Thêm dịch vụ
            </summary>
            <form
              action={createService}
              className="card absolute right-0 z-10 mt-2 flex w-64 flex-col gap-3 p-4"
            >
              <input name="name" required placeholder="Tên dịch vụ" className="input" />
              <input
                name="price"
                type="number"
                required
                placeholder="Giá (15000)"
                className="input"
              />
              <select name="category" className="input">
                <option value="food">Đồ ăn</option>
                <option value="drink">Nước uống</option>
                <option value="other">Khác</option>
              </select>
              <button className="btn btn-primary">Lưu</button>
            </form>
          </details>
        )}
      </div>

      {Object.entries(grouped).map(([cat, items]) => (
        <section key={cat}>
          <h2 className="mb-3 font-semibold">
            {CAT_LABEL[cat as ServiceCategory]}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((s) => (
              <div
                key={s.id}
                className={`card flex flex-col gap-2 p-4 ${
                  s.is_available ? "" : "opacity-50"
                }`}
              >
                <p className="font-bold">{s.name}</p>
                <p className="text-amber-400">{vnd(s.price)}</p>
                {isAdmin && (
                  <div className="mt-1 flex gap-2">
                    <form action={toggleService} className="flex-1">
                      <input type="hidden" name="id" value={s.id} />
                      <button className="btn btn-ghost w-full text-xs">
                        {s.is_available ? "Ẩn (hết hàng)" : "Hiện lại"}
                      </button>
                    </form>
                    <form action={deleteService}>
                      <input type="hidden" name="id" value={s.id} />
                      <button className="btn btn-ghost text-xs text-red-400">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
