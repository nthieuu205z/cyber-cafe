import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Đóng gói gọn để chạy trong Docker (tạo .next/standalone/server.js)
  output: "standalone",
};

export default nextConfig;
