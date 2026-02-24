import type { UUID, Timestamps, Status } from "./common";

export type VehicleType = {
  id: UUID;
  name: string;
  description: string | null;
  status: Status;
} & Timestamps;
