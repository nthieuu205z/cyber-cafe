import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { vnd, dateOnly } from "@/lib/format";
import {
  topUp,
  changeRole,
  toggleActive,
  createUser,
} from "@/lib/actions";
import type { Role } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await requireUser(["admin"]);

  const users = await query<{
    id: string;
    username: string;
    role: Role;
    balance: string;
    is_active: boolean;
    created_at: string;
  }>("select * from users order by role, username");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">👥 Quản lý người dùng</h1>
        <details className="relative">
          <summary className="btn btn-primary list-none">
            <Plus className="h-4 w-4" /> Thêm tài khoản
          </summary>
          <form
            action={createUser}
            className="card absolute right-0 z-10 mt-2 flex w-64 flex-col gap-3 p-4"
          >
            <input name="username" required placeholder="Tên đăng nhập" className="input" />
            <input name="password" required placeholder="Mật khẩu" className="input" />
            <select name="role" className="input">
              <option value="customer">Khách hàng</option>
              <option value="operator">Nhân viên</option>
              <option value="admin">Quản trị</option>
            </select>
            <button className="btn btn-primary">Tạo</button>
          </form>
        </details>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted">
            <tr>
              <th className="p-3">Tài khoản</th>
              <th className="p-3">Vai trò</th>
              <th className="p-3 text-right">Số dư</th>
              <th className="p-3">Ngày tạo</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Nạp tiền</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border/50">
                <td className="p-3 font-medium">{u.username}</td>
                <td className="p-3">
                  <form action={changeRole} className="flex">
                    <input type="hidden" name="id" value={u.id} />
                    <select
                      name="role"
                      defaultValue={u.role}
                      className="input py-1"
                      // tự submit khi đổi qua nút bên cạnh
                    >
                      <option value="customer">Khách hàng</option>
                      <option value="operator">Nhân viên</option>
                      <option value="admin">Quản trị</option>
                    </select>
                    <button className="btn btn-ghost ml-1 px-2 text-xs">Lưu</button>
                  </form>
                </td>
                <td className="p-3 text-right text-amber-400">
                  {vnd(u.balance)}
                </td>
                <td className="p-3 text-muted">{dateOnly(u.created_at)}</td>
                <td className="p-3">
                  {u.is_active ? (
                    <span className="text-green-400">Hoạt động</span>
                  ) : (
                    <span className="text-red-400">Đã khóa</span>
                  )}
                </td>
                <td className="p-3">
                  <form action={topUp} className="flex gap-1">
                    <input type="hidden" name="user_id" value={u.id} />
                    <input
                      name="amount"
                      type="number"
                      min={1000}
                      step={1000}
                      placeholder="50000"
                      className="input w-24 py-1"
                    />
                    <button className="btn btn-primary px-2 text-xs">Nạp</button>
                  </form>
                </td>
                <td className="p-3">
                  <form action={toggleActive}>
                    <input type="hidden" name="id" value={u.id} />
                    <button className="btn btn-ghost text-xs">
                      {u.is_active ? "Khóa" : "Mở khóa"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
