import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "./db";
import type { Role, SessionUser } from "./types";

const COOKIE = "cc_session";

// Phiên đăng nhập đơn giản: lưu user id vào cookie httpOnly.
// (Demo — môi trường thật nên dùng JWT/iron-session + băm mật khẩu.)
export async function setSession(userId: string) {
  const c = await cookies();
  c.set(COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearSession() {
  const c = await cookies();
  c.delete(COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const c = await cookies();
  const id = c.get(COOKIE)?.value;
  if (!id) return null;
  const rows = await query<SessionUser>(
    "select id, username, role from users where id = $1 and is_active = true",
    [id]
  );
  return rows[0] ?? null;
}

// Bắt buộc đăng nhập; tuỳ chọn giới hạn theo vai trò.
export async function requireUser(roles?: Role[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (roles && !roles.includes(user.role)) redirect("/dashboard");
  return user;
}
