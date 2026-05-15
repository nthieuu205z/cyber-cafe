"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { query, pool } from "./db";
import { setSession, clearSession, requireUser } from "./auth";

// ---------- AUTH ----------
export async function loginAction(_prev: unknown, formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const rows = await query<{ id: string; role: string }>(
    "select id, role from users where username = $1 and password_hash = $2 and is_active = true",
    [username, password]
  );
  if (rows.length === 0) {
    return { error: "Sai tên đăng nhập hoặc mật khẩu" };
  }
  await setSession(rows[0].id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

// ---------- MACHINES ----------
export async function createMachine(formData: FormData) {
  await requireUser(["admin"]);
  await query(
    "insert into machines (name, price_per_hour, specs) values ($1, $2, $3)",
    [
      String(formData.get("name")),
      Number(formData.get("price_per_hour")),
      String(formData.get("specs") ?? ""),
    ]
  );
  revalidatePath("/machines");
}

export async function updateMachineStatus(formData: FormData) {
  await requireUser(["admin", "operator"]);
  await query("update machines set status = $1 where id = $2", [
    String(formData.get("status")),
    String(formData.get("id")),
  ]);
  revalidatePath("/machines");
  revalidatePath("/dashboard");
}

export async function deleteMachine(formData: FormData) {
  await requireUser(["admin"]);
  await query("delete from machines where id = $1", [
    String(formData.get("id")),
  ]);
  revalidatePath("/machines");
}

// ---------- SESSIONS ----------
export async function startSession(formData: FormData) {
  await requireUser(["admin", "operator"]);
  const machineId = String(formData.get("machine_id"));
  const userId = String(formData.get("user_id") || "") || null;
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query(
      "insert into sessions (machine_id, user_id) values ($1, $2)",
      [machineId, userId]
    );
    await client.query(
      "update machines set status = 'in_use' where id = $1",
      [machineId]
    );
    await client.query("commit");
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
  }
  revalidatePath("/machines");
  revalidatePath("/sessions");
  revalidatePath("/dashboard");
}

// Kết thúc phiên: tính giờ, cộng tiền dịch vụ, tạo hoá đơn, trừ số dư nếu trả bằng tài khoản.
export async function endSession(formData: FormData) {
  await requireUser(["admin", "operator"]);
  const sessionId = String(formData.get("session_id"));
  const paymentMethod = String(formData.get("payment_method") || "cash");
  const client = await pool.connect();
  try {
    await client.query("begin");
    const sRes = await client.query(
      `select s.id, s.machine_id, s.user_id, s.started_at, m.price_per_hour
       from sessions s join machines m on m.id = s.machine_id
       where s.id = $1 and s.ended_at is null`,
      [sessionId]
    );
    if (sRes.rows.length === 0) {
      await client.query("rollback");
      return;
    }
    const s = sRes.rows[0];
    const endedAt = new Date();
    const hours =
      (endedAt.getTime() - new Date(s.started_at).getTime()) / 3_600_000;
    const billedHours = Math.max(hours, 0);
    const sessionCost = Math.round(billedHours * Number(s.price_per_hour));

    const oRes = await client.query(
      "select coalesce(sum(total_price),0) as svc from orders where session_id = $1",
      [sessionId]
    );
    const serviceCost = Number(oRes.rows[0].svc);
    const total = sessionCost + serviceCost;

    await client.query(
      "update sessions set ended_at = $1, total_hours = $2, total_cost = $3 where id = $4",
      [endedAt.toISOString(), billedHours.toFixed(2), total, sessionId]
    );
    await client.query(
      "update machines set status = 'available' where id = $1",
      [s.machine_id]
    );
    await client.query(
      `insert into invoices (session_id, user_id, session_cost, service_cost, total, paid_at, payment_method)
       values ($1, $2, $3, $4, $5, now(), $6)`,
      [sessionId, s.user_id, sessionCost, serviceCost, total, paymentMethod]
    );
    if (paymentMethod === "balance" && s.user_id) {
      await client.query(
        "update users set balance = balance - $1 where id = $2",
        [total, s.user_id]
      );
    }
    await client.query("commit");
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
  }
  revalidatePath("/machines");
  revalidatePath("/sessions");
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
}

// ---------- ORDERS (dịch vụ thêm vào phiên) ----------
export async function addOrder(formData: FormData) {
  await requireUser(["admin", "operator"]);
  const sessionId = String(formData.get("session_id"));
  const serviceId = String(formData.get("service_id"));
  const qty = Math.max(1, Number(formData.get("quantity") || 1));
  const sv = await query<{ price: string }>(
    "select price from services where id = $1",
    [serviceId]
  );
  if (sv.length === 0) return;
  const totalPrice = Number(sv[0].price) * qty;
  await query(
    "insert into orders (session_id, service_id, quantity, total_price) values ($1,$2,$3,$4)",
    [sessionId, serviceId, qty, totalPrice]
  );
  revalidatePath("/sessions");
  revalidatePath("/services");
}

// ---------- SERVICES (CRUD) ----------
export async function createService(formData: FormData) {
  await requireUser(["admin"]);
  await query(
    "insert into services (name, price, category) values ($1,$2,$3)",
    [
      String(formData.get("name")),
      Number(formData.get("price")),
      String(formData.get("category") || "other"),
    ]
  );
  revalidatePath("/services");
}

export async function toggleService(formData: FormData) {
  await requireUser(["admin"]);
  await query(
    "update services set is_available = not is_available where id = $1",
    [String(formData.get("id"))]
  );
  revalidatePath("/services");
}

export async function deleteService(formData: FormData) {
  await requireUser(["admin"]);
  await query("delete from services where id = $1", [
    String(formData.get("id")),
  ]);
  revalidatePath("/services");
}

// ---------- USERS (admin) ----------
export async function topUp(formData: FormData) {
  const me = await requireUser(["admin"]);
  const userId = String(formData.get("user_id"));
  const amount = Number(formData.get("amount"));
  if (!(amount > 0)) return;
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query(
      "update users set balance = balance + $1 where id = $2",
      [amount, userId]
    );
    await client.query(
      "insert into top_ups (user_id, amount, operator_id) values ($1,$2,$3)",
      [userId, amount, me.id]
    );
    await client.query("commit");
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
  }
  revalidatePath("/users");
}

export async function changeRole(formData: FormData) {
  await requireUser(["admin"]);
  await query("update users set role = $1 where id = $2", [
    String(formData.get("role")),
    String(formData.get("id")),
  ]);
  revalidatePath("/users");
}

export async function toggleActive(formData: FormData) {
  await requireUser(["admin"]);
  await query(
    "update users set is_active = not is_active where id = $1",
    [String(formData.get("id"))]
  );
  revalidatePath("/users");
}

export async function createUser(formData: FormData) {
  await requireUser(["admin"]);
  await query(
    "insert into users (username, password_hash, role) values ($1,$2,$3) on conflict (username) do nothing",
    [
      String(formData.get("username")),
      String(formData.get("password")),
      String(formData.get("role") || "customer"),
    ]
  );
  revalidatePath("/users");
}
