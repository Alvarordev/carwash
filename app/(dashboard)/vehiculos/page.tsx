import type { Metadata } from "next";
import VehiclesTable from "@/components/vehiculos/VehiclesTable";

export const metadata: Metadata = {
  title: "Vehículos — CarWash",
  description: "Gestión de vehículos registrados en el sistema.",
};

export default function VehiculosPage() {
  return <VehiclesTable />;
}
