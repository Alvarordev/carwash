import type { UUID, Timestamps, Status } from "./common";

export type StaffRole = "admin" | "washer" | "cashier" | "supervisor";

export type StaffMember = {
  id: UUID;
  firstName: string;
  lastName: string;
  role: StaffRole;
  phone: string | null;
  email: string | null;
  hiredAt: string;
  status: Status;
} & Timestamps;
