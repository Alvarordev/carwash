import type { Metadata } from "next";
import { QuotesPage } from "@/components/cotizaciones/QuotesPage";

export const metadata: Metadata = {
  title: "Cotizaciones — CarWash",
  description: "Gestión de cotizaciones del negocio.",
};

export default function CotizacionesPage() {
  return <QuotesPage />;
}
