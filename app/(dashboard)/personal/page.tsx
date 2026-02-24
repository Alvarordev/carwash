import type { Metadata } from "next";
import StaffTable from "@/components/personal/StaffTable";

export const metadata: Metadata = {
  title: "Personal — CarWash",
  description: "Gestión de personal registrado en el sistema.",
};

export default function PersonalPage() {
  return <StaffTable />;
}
