-- ============================================================
-- CYBER CAFE MANAGER - DATABASE SCHEMA + SEED
-- PostgreSQL tự động chạy file này lần đầu khi container khởi tạo.
-- ============================================================

create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  username      text unique not null,
  password_hash text not null,
  role          text not null default 'customer'
                check (role in ('admin', 'operator', 'customer')),
  balance       numeric(12,2) not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create table if not exists machines (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  status          text not null default 'available'
                  check (status in ('available', 'in_use', 'maintenance', 'error')),
  price_per_hour  numeric(12,2) not null default 10000,
  specs           text,
  created_at      timestamptz not null default now()
);

create table if not exists sessions (
  id          uuid primary key default gen_random_uuid(),
  machine_id  uuid not null references machines(id) on delete cascade,
  user_id     uuid references users(id) on delete set null,
  started_at  timestamptz not null default now(),
  ended_at    timestamptz,
  total_hours numeric(8,2),
  total_cost  numeric(12,2)
);

create table if not exists services (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  price        numeric(12,2) not null,
  category     text not null default 'other'
               check (category in ('food', 'drink', 'other')),
  image_url    text,
  is_available boolean not null default true
);

create table if not exists orders (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references sessions(id) on delete cascade,
  service_id  uuid not null references services(id) on delete restrict,
  quantity    integer not null default 1 check (quantity > 0),
  total_price numeric(12,2) not null,
  created_at  timestamptz not null default now()
);

create table if not exists invoices (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null references sessions(id) on delete cascade,
  user_id        uuid references users(id) on delete set null,
  session_cost   numeric(12,2) not null default 0,
  service_cost   numeric(12,2) not null default 0,
  total          numeric(12,2) not null default 0,
  paid_at        timestamptz,
  payment_method text check (payment_method in ('cash', 'balance', 'transfer'))
);

create table if not exists top_ups (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  amount      numeric(12,2) not null check (amount > 0),
  operator_id uuid references users(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ===================== DỮ LIỆU MẪU =====================
insert into users (username, password_hash, role, balance) values
  ('admin',    'admin123', 'admin',    0),
  ('operator', 'oper123',  'operator', 0),
  ('khach01',  'khach123', 'customer', 50000),
  ('khach02',  'khach123', 'customer', 20000)
on conflict (username) do nothing;

insert into machines (name, status, price_per_hour, specs) values
  ('PC-01', 'available',   12000, 'i5 / 16GB / GTX 3060'),
  ('PC-02', 'available',   12000, 'i5 / 16GB / GTX 3060'),
  ('PC-03', 'available',   12000, 'i5 / 16GB / GTX 4070'),
  ('PC-04', 'maintenance', 12000, 'i5 / 16GB / GTX 4070'),
  ('PC-05', 'available',   20000, 'i9 / 32GB / RTX 5070'),
  ('PC-06', 'available',   20000, 'i9 / 32GB / RTX 5070'),
  ('PC-07', 'error',       20000, 'U9 / 128GB / RTX 6090'),
  ('PC-08', 'available',   20000, 'U9 / 128GB / RTX 6090');

insert into services (name, price, category) values
  ('Mì tôm trứng',    20000, 'food'),
  ('Cơm rang',        30000, 'food'),
  ('Xúc xích',        15000, 'food'),
  ('Coca Cola',       12000, 'drink'),
  ('Sting',           12000, 'drink'),
  ('Nước suối',        8000, 'drink'),
  ('Cà phê sữa',      18000, 'drink'),
  ('Tai nghe (thuê)', 10000, 'other');
