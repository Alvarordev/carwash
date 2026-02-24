"use client";

import { usePathname } from "next/navigation";
import {
  HomeSimpleDoor,
  PasteClipboard,
  Group,
  Car,
  Sparks,
  Community,
  Box,
  Percentage,
  Settings,
  PeopleTag,
} from "iconoir-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: HomeSimpleDoor },
  { label: "Órdenes", href: "/ordenes", icon: PasteClipboard },
  { label: "Clientes", href: "/clientes", icon: Group },
  { label: "Vehículos", href: "/vehiculos", icon: Car },
  { label: "Servicios", href: "/servicios", icon: Sparks },
  { label: "Personal", href: "/personal", icon: Community },
  { label: "Inventario", href: "/inventario", icon: Box },
  { label: "Promociones", href: "/promociones", icon: Percentage },
  { label: "Configuración", href: "/configuracion", icon: Settings },
];

export default function Topbar() {
  const pathname = usePathname();

  const current = navItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  const Icon = current?.icon;

  return (
    <header className="flex w-full justify-end items-center gap-3 px-6 pt-6.5 pb-10 bg-background xl:hidden-not-needed">
      {Icon && <PeopleTag className="size-7 text-foreground shrink-0 bg-primary p-0.5 rounded-full" />}
      <h2 className="text-base font-semibold text-foreground">
        Alvaro Rodriguez
      </h2>
    </header>
  );
}
