import type { Metadata } from "next";
import ExpensesTable from "@/components/gastos/ExpensesTable";

export const metadata: Metadata = {
  title: "Gastos — CarWash",
  description: "Gestión de gastos del negocio.",
};

export default function GastosPage() {
  return <ExpensesTable />;
}
