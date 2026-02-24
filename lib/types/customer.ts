import type { UUID, Timestamps, Status } from "./common";

export type Customer = {
  id: UUID;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  status: Status;
} & Timestamps;
