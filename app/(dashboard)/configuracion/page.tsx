"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WhatsAppTemplate, WhatsAppTriggerType } from "@/lib/types";
import { useWhatsApp } from "@/lib/hooks/useWhatsApp";
import { WhatsAppConfigCard } from "@/components/configuracion/WhatsAppConfigCard";
import { WhatsAppTemplateList } from "@/components/configuracion/WhatsAppTemplateList";
import { WhatsAppTemplateDialog } from "@/components/configuracion/WhatsAppTemplateDialog";

export default function ConfiguracionPage() {
  const {
    config,
    templates,
    loading,
    upsertConfig,
    createTemplate,
    updateTemplate,
    toggleTemplateActive,
  } = useWhatsApp();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);

  async function handleSaveConfig(data: {
    phoneNumberId: string;
    accessToken: string;
    isActive: boolean;
  }) {
    try {
      await upsertConfig(data);
      toast.success("WhatsApp configuration saved");
    } catch {
      toast.error("Error saving configuration");
    }
  }

  async function handleSaveTemplate(data: {
    name: string;
    body: string;
    triggerType: WhatsAppTriggerType;
  }) {
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, data);
        toast.success("Template updated");
      } else {
        await createTemplate(data);
        toast.success("Template created");
      }
    } catch {
      toast.error("Error saving template");
    }
  }

  async function handleToggleActive(id: string) {
    try {
      await toggleTemplateActive(id);
    } catch {
      toast.error("Error toggling template");
    }
  }

  function handleEditTemplate(template: WhatsAppTemplate) {
    setEditingTemplate(template);
    setDialogOpen(true);
  }

  function handleAddTemplate() {
    setEditingTemplate(null);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Configuration</h1>
        <p className="text-sm text-muted-foreground">
          Manage your carwash business settings and integrations.
        </p>
      </div>

      <Tabs defaultValue="whatsapp">
        <TabsList>
          <TabsTrigger value="business">Business Info</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicle Types</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="mt-6">
          <p className="text-muted-foreground">Business info settings coming soon.</p>
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <p className="text-muted-foreground">Payment methods settings coming soon.</p>
        </TabsContent>

        <TabsContent value="vehicles" className="mt-6">
          <p className="text-muted-foreground">Vehicle types settings coming soon.</p>
        </TabsContent>

        <TabsContent value="whatsapp" className="mt-6 space-y-6">
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <>
              <WhatsAppConfigCard config={config} onSave={handleSaveConfig} />
              <WhatsAppTemplateList
                templates={templates}
                onToggleActive={handleToggleActive}
                onEdit={handleEditTemplate}
                onAdd={handleAddTemplate}
              />
            </>
          )}
        </TabsContent>
      </Tabs>

      <WhatsAppTemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={editingTemplate}
        onSave={handleSaveTemplate}
      />
    </div>
  );
}
