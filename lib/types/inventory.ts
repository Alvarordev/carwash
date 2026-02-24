import type { UUID, Timestamps, Status } from "./common";

export type InventoryItem = {
  id: UUID;
  name: string;
  description: string | null;
  unit: string;
  quantity: number;
  minQuantity: number;
  status: Status;
} & Timestamps;
