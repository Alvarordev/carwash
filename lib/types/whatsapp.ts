import type { UUID } from "./common";

export type WhatsAppTriggerType = "delivery" | "scheduled";

export type WhatsAppMessageStatus = "pending" | "sent" | "failed";

export type WhatsAppConfig = {
  id: UUID;
  phoneNumberId: string;
  accessToken: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WhatsAppTemplate = {
  id: UUID;
  name: string;
  body: string;
  triggerType: WhatsAppTriggerType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WhatsAppServiceRule = {
  id: UUID;
  serviceId: UUID;
  templateId: UUID;
  delayDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WhatsAppScheduledMessage = {
  id: UUID;
  orderId: UUID;
  phone: string;
  templateId: UUID;
  scheduledAt: string;
  sentAt: string | null;
  status: WhatsAppMessageStatus;
  error: string | null;
  createdAt: string;
};

export type WhatsAppMessageLog = {
  id: UUID;
  orderId: UUID | null;
  phone: string;
  templateBody: string;
  sentAt: string | null;
  status: WhatsAppMessageStatus;
  metaMessageId: string | null;
  error: string | null;
  createdAt: string;
};
