import type { Metadata } from "next";
import CustomersTable from "@/components/clientes/CustomersTable";

export const metadata: Metadata = {
  title: "Clientes — CarWash",
  description: "Gestión de clientes registrados en el sistema.",
};

export default function ClientesPage() {
  return <CustomersTable />;
}
