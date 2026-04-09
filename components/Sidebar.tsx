"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  TrendingUp,
  Users,
  Settings,
} from "lucide-react";

const navItems = [
  { label: "Tableau de bord", href: "/tableau", icon: LayoutDashboard },
  { label: "Ventes", href: "/ventes", icon: ShoppingCart },
  { label: "Produits", href: "/produits", icon: Package },
  { label: "Offres & Promo", href: "/offres", icon: TrendingUp },
  { label: "Clients", href: "/clients", icon: Users },
  { label: "Configuration", href: "/configuration", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-52 bg-[#064e3b] text-white flex flex-col p-4 flex-shrink-0 min-h-screen">
      {/* Logo + Nom */}
      <div className="flex items-center gap-0 px-0 py-2 mb-2">
        <Image
          src="/logo.png"
          alt="7anouty logo"
          width={70}
          height={28}
          className="rounded-md flex-shrink-0"
        />
        <h1 className="text-lg font-medium text-white">7anouty</h1>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/65 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon size={18} strokeWidth={1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}