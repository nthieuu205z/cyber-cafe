import { Pool } from "pg";

// Một pool dùng chung cho toàn app. DATABASE_URL lấy từ biến môi trường.
// - Chạy bằng Docker Compose: postgres://cybercafe:cybercafe123@db:5432/cybercafe
// - Chạy local (next dev): postgres://cybercafe:cybercafe123@localhost:5432/cybercafe
const globalForDb = globalThis as unknown as { _pool?: Pool };

const connectionString =
  process.env.DATABASE_URL ??
  "postgres://cybercafe:cybercafe123@localhost:5432/cybercafe";

export const pool =
  globalForDb._pool ??
  new Pool({
    connectionString,
    ssl: connectionString.includes("railway.app")
      ? { rejectUnauthorized: false }
      : false,
  });

if (process.env.NODE_ENV !== "production") globalForDb._pool = pool;

// Helper truy vấn ngắn gọn, trả về mảng dòng kết quả.
export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const res = await pool.query(text, params as never[]);
  return res.rows as T[];
}
