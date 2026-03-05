"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { WhatsAppTemplate, WhatsAppTriggerType } from "@/lib/types";
import { useWhatsApp } from "@/lib/hooks/useWhatsApp";
import { WhatsAppConfigCard } from "@/components/configuracion/WhatsAppConfigCard";
import { WhatsAppTemplateList } from "@/components/configuracion/WhatsAppTemplateList";
import { WhatsAppTemplateDialog } from "@/components/configuracion/WhatsAppTemplateDialog";
import { RolesSection } from "@/components/configuracion/negocio/RolesSection";
import { VehicleTypesSection } from "@/components/configuracion/negocio/VehicleTypesSection";
import { ServiceCategoriesSection } from "@/components/configuracion/negocio/ServiceCategoriesSection";
import { PaymentMethodsSection } from "@/components/configuracion/negocio/PaymentMethodsSection";

const TABS = [
  { value: "business", label: "Información del Negocio" },
  { value: "whatsapp", label: "Notificaciones WhatsApp" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("business");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const el = tabRefs.current[activeTab];
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [activeTab]);

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
      toast.success("Configuración de WhatsApp guardada");
    } catch {
      toast.error("Error al guardar la configuración");
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
        toast.success("Plantilla actualizada");
      } else {
        await createTemplate(data);
        toast.success("Plantilla creada");
      }
    } catch {
      toast.error("Error al guardar la plantilla");
    }
  }

  async function handleToggleActive(id: string) {
    try {
      await toggleTemplateActive(id);
    } catch {
      toast.error("Error al cambiar el estado de la plantilla");
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
        <h1 className="text-2xl font-semibold">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Administra la información y ajustes de tu negocio.
        </p>
      </div>

      {/* Animated tab bar */}
      <div className="relative border-b border-border">
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              ref={(el) => {
                tabRefs.current[tab.value] = el;
              }}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-3 text-sm transition-colors ${
                activeTab === tab.value
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div
          className="absolute bottom-0 h-[2px] bg-primary transition-all duration-300 ease-in-out"
          style={{ left: indicator.left, width: indicator.width }}
        />
      </div>

      {/* Tab content */}
      {activeTab === "business" && (
        <div className="space-y-8">
          <RolesSection />
          <VehicleTypesSection />
          <ServiceCategoriesSection />
          <PaymentMethodsSection />
        </div>
      )}

      {activeTab === "whatsapp" && (
        <div className="space-y-6">
          {loading ? (
            <p className="text-muted-foreground">Cargando...</p>
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
        </div>
      )}

      <WhatsAppTemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={editingTemplate}
        onSave={handleSaveTemplate}
      />
    </div>
  );
}
