import type { UUID, Timestamps, Status } from "./common";

export type UserRole = "admin" | "operator";

export type Company = {
  id: UUID;
  name: string;
  slug: string;
  status: Status;
} & Timestamps;

export type UserProfile = {
  id: UUID;
  companyId: UUID;
  firstName: string;
  lastName: string;
  role: UserRole;
  email?: string;
  companyName?: string;
} & Pick<Timestamps, "createdAt">;
