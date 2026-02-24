import type { Metadata } from "next";
import ServicesCatalog from "@/components/servicios/ServicesCatalog";

export const metadata: Metadata = {
  title: "Servicios — CarWash",
  description: "Catálogo de servicios de lavado y detallado.",
};

export default function ServiciosPage() {
  return <ServicesCatalog />;
}
