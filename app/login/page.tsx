"use client";

import { useActionState } from "react";
import { Terminal } from "lucide-react";
import { loginAction } from "@/lib/actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="card w-full max-w-sm p-8">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
            <Terminal className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold">Cyber Cafe Manager</h1>
          <p className="text-sm text-muted">Đăng nhập để tiếp tục</p>
        </div>

        <form action={action} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm text-muted">
              Tên đăng nhập
            </label>
            <input
              name="username"
              required
              className="input"
              placeholder="admin"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">Mật khẩu</label>
            <input
              name="password"
              type="password"
              required
              className="input"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {state?.error && (
            <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="btn btn-primary mt-2"
          >
            {pending ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="mt-6 rounded-lg border border-border bg-bg p-3 text-xs text-muted">
          <p className="mb-1 font-medium text-text">Tài khoản demo:</p>
          <p>admin / admin123 — Quản trị</p>
          <p>operator / oper123 — Nhân viên</p>
        </div>
      </div>
    </div>
  );
}
