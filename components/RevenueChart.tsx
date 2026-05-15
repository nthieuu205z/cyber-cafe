"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function RevenueChart({
  data,
}: {
  data: { d: string; total: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a44" />
        <XAxis dataKey="d" stroke="#94a3b8" fontSize={12} />
        <YAxis
          stroke="#94a3b8"
          fontSize={12}
          tickFormatter={(v) => `${(v / 1000).toLocaleString("vi-VN")}k`}
        />
        <Tooltip
          contentStyle={{
            background: "#1a1a2e",
            border: "1px solid #2a2a44",
            borderRadius: 8,
            color: "#e5e7eb",
          }}
          formatter={(v) => [
            `${Number(v).toLocaleString("vi-VN")} ₫`,
            "Doanh thu",
          ]}
        />
        <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
