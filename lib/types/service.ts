import type { UUID, Timestamps, Status } from "./common";

export type Service = {
  id: UUID;
  name: string;
  description: string | null;
  status: Status;
} & Timestamps;

export type ServicePricing = {
  id: UUID;
  serviceId: UUID;
  vehicleTypeId: UUID;
  price: number;
  status: Status;
} & Timestamps;
