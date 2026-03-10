import type { UUID, Timestamps, Status } from "./common";

export type ServiceCategory = {
  id: UUID;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  status: Status;
  companyId: string;
} & Timestamps;

export type Service = {
  id: UUID;
  name: string;
  description: string | null;
  categoryId: string;
  status: Status;
  color: string | null;
  icon: string | null;
} & Timestamps;

export type ServicePricing = {
  id: UUID;
  serviceId: UUID;
  vehicleTypeId: UUID;
  price: number;
  status: Status;
} & Timestamps;
