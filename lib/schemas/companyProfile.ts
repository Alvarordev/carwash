import { z } from "zod";

export const companyProfileSchema = z.object({
  ruc: z.string().max(20).nullable().optional(),
  ownerName: z.string().max(200).nullable().optional(),
  address: z.string().max(300).nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
});

export type CompanyProfileFormData = z.infer<typeof companyProfileSchema>;
