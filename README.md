# 🖥️ Cyber Cafe Manager

Phần mềm quản lý quán net / cyber cafe.
**Stack:** Next.js 16 + React 19 + Tailwind v4 + PostgreSQL — chạy hoàn toàn bằng **Docker** (miễn phí, không cần Azure cloud).

---

## 🚀 Chạy ứng dụng (1 lệnh)

Yêu cầu: đã cài **Docker Desktop**.

```bash
cd cyber-cafe
docker compose up -d --build
```

Mở trình duyệt: **http://localhost:3000**

Dừng: `docker compose down`
Dừng và xóa luôn dữ liệu DB: `docker compose down -v`
Xem log: `docker compose logs -f app`

---

## 🔑 Tài khoản demo

| Tài khoản | Mật khẩu  | Vai trò             |
| --------- | --------- | ------------------- |
| `admin`   | `admin123`| Quản trị (toàn quyền) |
| `operator`| `oper123` | Nhân viên           |
| `khach01` | `khach123`| Khách (số dư 50.000) |

---

## 🗄️ Xem database bằng Azure Data Studio

PostgreSQL chạy trong Docker và **mở cổng 5432** ra ngoài. Trong Azure Data Studio:

1. Cài extension **PostgreSQL** (nếu chưa có).
2. New Connection với thông tin:

| Trường        | Giá trị        |
| ------------- | -------------- |
| Server / Host | `localhost`    |
| Port          | `5432`         |
| User          | `cybercafe`    |
| Password      | `cybercafe123` |
| Database      | `cybercafe`    |

→ Kết nối là thấy toàn bộ bảng và dữ liệu.

---

## 📦 Cấu trúc

```
cyber-cafe/
├── app/
│   ├── login/                 # Đăng nhập
│   └── (app)/                 # Khu vực sau đăng nhập (có sidebar)
│       ├── dashboard/         # Tổng quan + biểu đồ
│       ├── machines/          # Quản lý máy, mở/đóng phiên
│       ├── sessions/          # Phiên + đếm giờ realtime
│       ├── services/          # Dịch vụ (đồ ăn/uống)
│       ├── invoices/          # Hóa đơn + in
│       ├── users/             # Người dùng + nạp tiền (admin)
│       └── reports/           # Báo cáo doanh thu (admin)
├── components/                # Sidebar, Timer, Chart, ...
├── lib/                       # db, auth, actions, types, format
├── db/init/01_init.sql        # Tự tạo bảng + dữ liệu mẫu lần đầu
├── Dockerfile
└── docker-compose.yml
```

## 💻 Chạy chế độ dev (không bắt buộc)

```bash
docker compose up -d db          # chỉ chạy database
npm install
npm run dev                      # app tại http://localhost:3000
```

---

## ☁️ Đưa lên Azure cloud sau này

Code đã sẵn Docker nên deploy dễ. Cách phổ biến nhất:
**Azure App Service (Web App for Containers)** + **Azure Database for PostgreSQL**.
Chỉ cần đổi biến môi trường `DATABASE_URL` trỏ tới DB trên Azure.

> ⚠️ Demo dùng mật khẩu dạng plain text và không bật RLS — chạy thật cần băm
> mật khẩu (bcrypt) và thêm phân quyền ở tầng DB.
