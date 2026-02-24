import type { UUID, Timestamps, Status } from "./common";

export type StaffRole = "admin" | "washer" | "cashier" | "supervisor";
export type DocumentType = "dni" | "carnet_extranjeria" | "pasaporte";

export type StaffMember = {
  id: UUID;
  firstName: string;
  lastName: string;
  docType: DocumentType | null;
  docNumber: string | null;
  role: StaffRole;
  phone: string | null;
  email: string | null;
  status: Status;
} & Timestamps;
