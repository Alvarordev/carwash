import type { UUID, Timestamps, Status } from "./common";

export type ServiceCategory = "exterior" | "interior" | "detalle" | "añadido";

export type Service = {
  id: UUID;
  name: string;
  description: string | null;
  category: ServiceCategory;
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
