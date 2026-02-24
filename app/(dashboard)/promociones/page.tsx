import type { Metadata } from "next";
import PromotionsTable from "@/components/promociones/PromotionsTable";

export const metadata: Metadata = {
  title: "Promociones — CarWash",
  description: "Gestión de promociones y descuentos del sistema.",
};

export default function PromocionesPage() {
  return <PromotionsTable />;
}
