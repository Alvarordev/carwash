"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  WhatsAppConfig,
  WhatsAppTemplate,
  WhatsAppMessageLog,
} from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { getCompanyId } from "@/lib/supabase/get-company-id";

function mapConfig(row: Record<string, unknown>): WhatsAppConfig {
  return {
    id: row.id as string,
    phoneNumberId: row.phone_number_id as string,
    accessToken: row.access_token as string,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapTemplate(row: Record<string, unknown>): WhatsAppTemplate {
  return {
    id: row.id as string,
    name: row.name as string,
    body: row.body as string,
    triggerType: row.trigger_type as WhatsAppTemplate["triggerType"],
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapMessageLog(row: Record<string, unknown>): WhatsAppMessageLog {
  return {
    id: row.id as string,
    orderId: (row.order_id as string) ?? null,
    phone: row.phone as string,
    templateBody: row.template_body as string,
    sentAt: (row.sent_at as string) ?? null,
    status: row.status as WhatsAppMessageLog["status"],
    metaMessageId: (row.meta_message_id as string) ?? null,
    error: (row.error as string) ?? null,
    createdAt: row.created_at as string,
  };
}

export function useWhatsApp() {
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [messageLog, setMessageLog] = useState<WhatsAppMessageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("whatsapp_config")
        .select("*")
        .maybeSingle();

      if (err) throw new Error(err.message);
      setConfig(data ? mapConfig(data as Record<string, unknown>) : null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const upsertConfig = useCallback(
    async (data: {
      phoneNumberId: string;
      accessToken: string;
      isActive: boolean;
    }): Promise<WhatsAppConfig> => {
      const company_id = await getCompanyId();
      const payload = {
        company_id,
        phone_number_id: data.phoneNumberId,
        access_token: data.accessToken,
        is_active: data.isActive,
      };

      const { data: result, error: err } = await supabase
        .from("whatsapp_config")
        .upsert(payload, { onConflict: "company_id" })
        .select()
        .single();

      if (err) throw new Error(err.message);
      const mapped = mapConfig(result as Record<string, unknown>);
      setConfig(mapped);
      return mapped;
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const fetchTemplates = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from("whatsapp_templates")
        .select("*")
        .order("name");

      if (err) throw new Error(err.message);
      setTemplates((data ?? []).map((d) => mapTemplate(d as Record<string, unknown>)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const createTemplate = useCallback(
    async (data: {
      name: string;
      body: string;
      triggerType: WhatsAppTemplate["triggerType"];
    }): Promise<WhatsAppTemplate> => {
      const company_id = await getCompanyId();
      const { data: created, error: err } = await supabase
        .from("whatsapp_templates")
        .insert({
          company_id,
          name: data.name,
          body: data.body,
          trigger_type: data.triggerType,
        })
        .select()
        .single();

      if (err) throw new Error(err.message);
      const newTemplate = mapTemplate(created as Record<string, unknown>);
      setTemplates((prev) => [...prev, newTemplate]);
      return newTemplate;
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const updateTemplate = useCallback(
    async (
      id: string,
      data: {
        name: string;
        body: string;
        triggerType: WhatsAppTemplate["triggerType"];
      }
    ): Promise<WhatsAppTemplate> => {
      const { data: updated, error: err } = await supabase
        .from("whatsapp_templates")
        .update({
          name: data.name,
          body: data.body,
          trigger_type: data.triggerType,
        })
        .eq("id", id)
        .select()
        .single();

      if (err) throw new Error(err.message);
      const result = mapTemplate(updated as Record<string, unknown>);
      setTemplates((prev) => prev.map((t) => (t.id === id ? result : t)));
      return result;
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const deleteTemplate = useCallback(async (id: string): Promise<void> => {
    const { error: err } = await supabase
      .from("whatsapp_templates")
      .delete()
      .eq("id", id);
    if (err) throw new Error(err.message);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleTemplateActive = useCallback(
    async (id: string): Promise<void> => {
      const existing = templates.find((t) => t.id === id);
      if (!existing) throw new Error("Template no encontrado");
      const { data: updated, error: err } = await supabase
        .from("whatsapp_templates")
        .update({ is_active: !existing.isActive })
        .eq("id", id)
        .select()
        .single();

      if (err) throw new Error(err.message);
      const result = mapTemplate(updated as Record<string, unknown>);
      setTemplates((prev) => prev.map((t) => (t.id === id ? result : t)));
    },
    [templates] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const fetchMessageLog = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from("whatsapp_message_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (err) throw new Error(err.message);
      setMessageLog(
        (data ?? []).map((d) => mapMessageLog(d as Record<string, unknown>))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    Promise.all([fetchConfig(), fetchTemplates(), fetchMessageLog()]);
  }, [fetchConfig, fetchTemplates, fetchMessageLog]);

  return {
    config,
    templates,
    messageLog,
    loading,
    error,
    fetchConfig,
    upsertConfig,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    toggleTemplateActive,
    fetchMessageLog,
  };
}
