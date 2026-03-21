"use client";

import { useState, useEffect, useRef } from "react";
import { CompanyProfileSection } from "@/components/configuracion/negocio/CompanyProfileSection";
import { VehicleTypesSection } from "@/components/configuracion/negocio/VehicleTypesSection";
import { ServiceCategoriesSection } from "@/components/configuracion/negocio/ServiceCategoriesSection";
import { PaymentMethodsSection } from "@/components/configuracion/negocio/PaymentMethodsSection";
import { ExpenseCategoriesSection } from "@/components/configuracion/negocio/ExpenseCategoriesSection";

const TABS = [
  { value: "business", label: "Información del Negocio" },
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Administra la información y ajustes de tu negocio.
        </p>
      </div>

      {/* Tab bar */}
      <div className="relative border-b border-border">
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              ref={(el) => { tabRefs.current[tab.value] = el; }}
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
          className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-in-out"
          style={{ left: indicator.left, width: indicator.width }}
        />
      </div>

      {activeTab === "business" && (
        <div className="space-y-8">
          <CompanyProfileSection />
          <VehicleTypesSection />
          <ServiceCategoriesSection />
          <PaymentMethodsSection />
          <ExpenseCategoriesSection />
        </div>
      )}
    </div>
  );
}
