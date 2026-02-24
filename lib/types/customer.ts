import type { UUID, Timestamps, Status } from "./common";

export type DocumentType = "dni" | "carnet_extranjeria" | "pasaporte";

export type Customer = {
  id: UUID;
  firstName: string;
  lastName: string;
  docType: DocumentType | null;
  docNumber: string | null;
  phone: string | null;
  email: string | null;
  status: Status;
} & Timestamps;
