import type { UUID, Timestamps } from "./common";

export type Expense = {
  id: UUID;
  companyId: string;
  detail: string;
  categoryId: string;
  categoryName: string | null;
  staffMemberId: string | null;
  staffMemberName: string | null;
  amount: number;
  date: string;
} & Timestamps;
