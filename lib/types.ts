export type Role = "admin" | "operator" | "customer";
export type MachineStatus = "available" | "in_use" | "maintenance" | "error";
export type ServiceCategory = "food" | "drink" | "other";
export type PaymentMethod = "cash" | "balance" | "transfer";

export interface User {
  id: string;
  username: string;
  role: Role;
  balance: number;
  is_active: boolean;
  created_at: string;
}

export interface Machine {
  id: string;
  name: string;
  status: MachineStatus;
  price_per_hour: number;
  specs: string | null;
  created_at: string;
}

export interface Session {
  id: string;
  machine_id: string;
  user_id: string | null;
  started_at: string;
  ended_at: string | null;
  total_hours: number | null;
  total_cost: number | null;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  category: ServiceCategory;
  image_url: string | null;
  is_available: boolean;
}

export interface SessionUser {
  id: string;
  username: string;
  role: Role;
}
