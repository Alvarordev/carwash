import type { Metadata } from "next";
import StaffDetailLayout from "@/components/personal/StaffDetailLayout";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Personal ${id} — CarWash`,
    description: "Detalle de rendimiento y participación de personal.",
  };
}

export default async function StaffDetailPage({ params }: Props) {
  const { id } = await params;
  return <StaffDetailLayout staffId={id} />;
}
