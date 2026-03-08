"use client";

import { useTransition } from "react";
import { Menu, Xmark, LogOut, User } from "iconoir-react";
import { signOut } from "@/lib/actions/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TopbarProps = {
  onToggleSidebar: () => void;
  mobileOpen: boolean;
  displayName: string;
};

export default function Topbar({ onToggleSidebar, mobileOpen, displayName }: TopbarProps) {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
    });
  };

  return (
    <header className="flex w-full items-center gap-3 px-4 sm:px-6 pt-4 sm:pt-6.5 pb-4 sm:pb-6 bg-background">
      <button
        onClick={onToggleSidebar}
        className="xl:hidden rounded-lg p-2 -ml-2 text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
        aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {mobileOpen ? (
          <Xmark className="size-5" />
        ) : (
          <Menu className="size-5" />
        )}
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-card transition-colors cursor-pointer">
            <User className="size-7 text-foreground shrink-0 bg-primary p-0.5 rounded-full" />
            <span className="text-sm font-semibold text-foreground hidden sm:inline">
              {displayName}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={handleSignOut}
            disabled={isPending}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            <LogOut className="size-4" />
            {isPending ? "Saliendo…" : "Cerrar sesión"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
