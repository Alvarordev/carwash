"use client";

import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export default function AdminTopbar() {
  return (
    <header className="border-b border-border bg-card px-4 sm:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-foreground">CarWash</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm text-muted-foreground">Super Admin</span>
      </div>
      <form action={signOut}>
        <Button
          type="submit"
          variant="outline"
          size="sm"
          className="border-border rounded-sm"
        >
          Cerrar sesión
        </Button>
      </form>
    </header>
  );
}
