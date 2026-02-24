import type { UUID, Timestamps, Status } from "./common";

export type Vehicle = {
  id: UUID;
  plate: string;
  color: string;
  brand: string;
  model: string | null;
  vehicleTypeId: UUID;
  ownerIds: UUID[];
  status: Status;
} & Timestamps;
