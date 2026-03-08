"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeSimpleDoor,
  PasteClipboard,
  Group,
  Car,
  Sparks,
  Community,
  Percentage,
  Settings,
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
  { label: "Promociones", href: "/promociones", icon: Percentage },
  { label: "Configuración", href: "/configuracion", icon: Settings },
];

type SidebarProps = {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
};

export default function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const navContent = (
    <nav className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-5 pt-6.5 pb-13.5">
        <span className="text-2xl font-bold tracking-tight text-primary">
          CarWash
        </span>
      </div>

      <ul className="flex flex-col gap-3 px-3 flex-1">
        {navItems.map(({ label, href, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2 text-base font-medium transition-colors ${
                isActive(href)
                  ? "bg-card text-white"
                  : "text-muted-foreground hover:bg-card hover:text-foreground"
              }`}
            >
              <Icon
                className={`size-5 shrink-0 ${isActive(href) ? "fill-white" : ""}`}
              />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <>
      <aside className="hidden xl:flex xl:w-57.5 xl:shrink-0 flex-col bg-background border-r border-border min-h-screen">
        {navContent}
      </aside>

      {mobileOpen && (
        <div
          className="xl:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`xl:hidden fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {navContent}
      </aside>
    </>
  );
}
