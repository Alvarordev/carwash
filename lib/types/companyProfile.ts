import type { UUID, Timestamps } from "./common";

export type CompanyProfile = {
  id: UUID;
  companyId: UUID;
  ruc: string | null;
  ownerName: string | null;
  address: string | null;
  phone: string | null;
  logoUrl: string | null;
} & Timestamps;
