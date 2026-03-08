import type { ReactNode } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";

export const metadata = { title: "Admin — CarWash" };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdminTopbar />
      <main className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full">{children}</main>
    </div>
  );
}
