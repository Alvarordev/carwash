"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "iconoir-react";
import { Button } from "@/components/ui/button";
import EmpresasTable from "./EmpresasTable";
import UsersTable from "./UsersTable";
import CreateUserDialog from "./CreateUserDialog";
import type { Company, UserProfile } from "@/lib/types";

type Props = {
  companies: Company[];
  users: UserProfile[];
};

export default function AdminPageClient({ companies, users }: Props) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  const refresh = () => router.refresh();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          Panel de Administración
        </h1>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-primary text-foreground px-4 sm:px-6 font-semibold gap-1.5 shrink-0 rounded-sm cursor-pointer"
          size="lg"
        >
          <Plus className="size-5 stroke-2" />
          <span className="hidden sm:inline">Nuevo usuario</span>
        </Button>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">
          Empresas{" "}
          <span className="text-muted-foreground font-normal text-sm">
            ({companies.length})
          </span>
        </h2>
        <EmpresasTable companies={companies} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">
          Usuarios{" "}
          <span className="text-muted-foreground font-normal text-sm">
            ({users.length})
          </span>
        </h2>
        <UsersTable users={users} />
      </section>

      <CreateUserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        companies={companies}
        onSuccess={refresh}
      />
    </div>
  );
}
