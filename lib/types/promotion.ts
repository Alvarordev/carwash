import type { UUID, Timestamps, Status } from "./common";

export type DiscountType = "percentage" | "fixed";

export type PromotionScope = "all" | "service" | "vehicleType";

export type Promotion = {
  id: UUID;
  name: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  scope: PromotionScope;
  scopeIds: UUID[];
  startDate: string | null;
  endDate: string | null;
  status: Status;
} & Timestamps;
